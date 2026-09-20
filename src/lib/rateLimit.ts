/**
 * Rate Limiting Module
 * Prevents brute force attacks, spam submissions, and API abuse.
 */

import { NextRequest, NextResponse } from 'next/server'
import { SecurityConfig } from './security'

// In-memory store for rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  requestCounts.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => requestCounts.delete(key))
}, 5 * 60 * 1000)

/**
 * Get client IP identifier from Request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

/**
 * Custom flexible rate limiter for API routes
 * Returns { allowed: boolean, remaining: number, resetSeconds: number }
 */
export function checkCustomRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now()
  const clientData = requestCounts.get(key)

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1, resetSeconds: Math.ceil(windowMs / 1000) }
  }

  if (clientData.count >= maxRequests) {
    const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000)
    return { allowed: false, remaining: 0, resetSeconds }
  }

  clientData.count++
  requestCounts.set(key, clientData)
  const remaining = maxRequests - clientData.count
  const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000)

  return { allowed: true, remaining, resetSeconds }
}

/**
 * Standard Next.js Request rate limiting middleware helper
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request)
  const clientId = `ip_${ip}`
  const now = Date.now()
  const windowMs = SecurityConfig.rateLimit.windowMs
  const maxRequests = SecurityConfig.rateLimit.maxRequests

  const clientData = requestCounts.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + windowMs,
    })
    return null
  }

  if (clientData.count >= maxRequests) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': clientData.resetTime.toString(),
        },
      }
    )
  }

  clientData.count++
  requestCounts.set(clientId, clientData)
  return null
}

/**
 * Login rate limiting helper
 */
export function loginRateLimit(email: string): { allowed: boolean; error?: string } {
  const key = `login_${email.trim().toLowerCase()}`
  const result = checkCustomRateLimit(key, SecurityConfig.rateLimit.maxLoginAttempts || 10, SecurityConfig.rateLimit.loginWindowMs || 15 * 60 * 1000)
  if (!result.allowed) {
    return {
      allowed: false,
      error: `Too many login attempts. Please try again in ${Math.ceil(result.resetSeconds / 60)} minutes.`,
    }
  }
  return { allowed: true }
}
