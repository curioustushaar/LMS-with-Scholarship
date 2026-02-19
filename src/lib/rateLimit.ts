/**
 * Simple Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

import { NextRequest, NextResponse } from 'next/server'
import { SecurityConfig } from './security'

// In-memory store for rate limiting (use Redis in production)
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
 * Get client identifier (IP or user ID)
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  
  // Try to get user ID from authorization header
  const auth = request.headers.get('authorization')
  if (auth) {
    // Use a hash of the token as identifier
    return `auth_${auth.substring(auth.length - 20)}`
  }
  
  return `ip_${ip}`
}

/**
 * Rate limiting middleware
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  const clientId = getClientId(request)
  const now = Date.now()
  const windowMs = SecurityConfig.rateLimit.windowMs
  const maxRequests = SecurityConfig.rateLimit.maxRequests
  
  const clientData = requestCounts.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    })
    return null // Allow request
  }
  
  if (clientData.count >= maxRequests) {
    // Rate limit exceeded
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': clientData.resetTime.toString()
        }
      }
    )
  }
  
  // Increment counter
  clientData.count++
  requestCounts.set(clientId, clientData)
  
  return null // Allow request
}

/**
 * Login rate limiting (stricter)
 */
export function loginRateLimit(email: string): { allowed: boolean; error?: string } {
  const now = Date.now()
  const windowMs = SecurityConfig.rateLimit.loginWindowMs
  const maxAttempts = SecurityConfig.rateLimit.maxLoginAttempts
  const key = `login_${email}`
  
  const loginData = requestCounts.get(key)
  
  if (!loginData || now > loginData.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true }
  }
  
  if (loginData.count >= maxAttempts) {
    const minutesLeft = Math.ceil((loginData.resetTime - now) / 60000)
    return { 
      allowed: false, 
      error: `Too many login attempts. Please try again in ${minutesLeft} minutes.` 
    }
  }
  
  loginData.count++
  requestCounts.set(key, loginData)
  
  return { allowed: true }
}
