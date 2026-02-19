import { NextRequest } from 'next/server'
import { supabase } from './supabase'
import { logger } from './logger'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'student'
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return data.role === 'admin'
}

/**
 * Get user from request headers
 * Verifies Supabase JWT token
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      logger.error('Auth verification failed')
      return null
    }

    // Get user details from public.profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      logger.error('Database query error')
      // Continue with authenticated user
    }

    if (!data) {
      // Check if user has role in metadata as fallback
      const metaRole = user.app_metadata?.role || user.user_metadata?.role || 'student'
      
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: metaRole as 'admin' | 'student'
      } as AuthUser
    }

    return data as AuthUser
  } catch (error) {
    logger.error('Authentication error')
    return null
  }
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return user
}

/**
 * Require any authenticated user
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(request)

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return user
}
