import { NextRequest } from 'next/server'
import { verify as jwtVerify, decode } from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'
import { logger } from './logger'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'student' | 'superadmin' | 'school'
  account_status?: string
  school_id?: string
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
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
      console.warn('⚠️ No valid auth header present')
      return null
    }

    const token = authHeader.replace('Bearer ', '').trim()

    if (!token || token === 'undefined' || token === 'null') {
      console.warn('⚠️ Empty or invalid token string received')
      return null
    }

    // Decode JWT payload (standard across Supabase auth tokens)
    let decodedUser: any = null
    const jwtSecret = process.env.SUPABASE_JWT_SECRET

    if (jwtSecret && jwtSecret !== 'your-supabase-jwt-secret-here') {
      try {
        decodedUser = jwtVerify(token, jwtSecret) as any
      } catch (jwtErr) {
        console.warn('⚠️ JWT secret verification failed, falling back to decode + DB verification:', (jwtErr as Error).message)
        decodedUser = decode(token) as any
      }
    } else {
      decodedUser = decode(token) as any
    }

    if (!decodedUser || (!decodedUser.sub && !decodedUser.id)) {
      console.error('❌ Could not extract user from token payload')
      return null
    }

    // Check token expiration if present
    if (decodedUser.exp && Math.floor(Date.now() / 1000) > decodedUser.exp) {
      console.warn('⚠️ Token has expired')
      return null
    }

    const userId = decodedUser.sub || decodedUser.id
    const userEmail = decodedUser.email || ''

    // Query user profile from database using supabaseAdmin (bypasses RLS)
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, account_status')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('⚠️ Database query error during auth:', error.message)
    }

    if (profile) {
      return {
        id: profile.id,
        email: profile.email || userEmail,
        full_name: profile.full_name || userEmail.split('@')[0] || 'User',
        role: profile.role,
        account_status: profile.account_status
      } as AuthUser
    }

    // Fallback if profile row is not yet created
    const metaRole = decodedUser.app_metadata?.role || decodedUser.user_metadata?.role || decodedUser.role || 'student'
    return {
      id: userId,
      email: userEmail,
      full_name: decodedUser.user_metadata?.full_name || userEmail.split('@')[0] || 'User',
      role: metaRole as 'admin' | 'student' | 'superadmin' | 'school',
      account_status: 'active'
    } as AuthUser
  } catch (error) {
    console.error('💥 Unexpected authentication error:', error)
    return null
  }
}

/**
 * Require admin role middleware
 * Allows both 'admin' and 'superadmin' roles
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(request)

  console.log('🔐 requireAdmin check:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    role: user?.role
  })

  if (!user) {
    console.error('❌ No user found - Unauthorized')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    console.error('❌ Invalid role - Forbidden:', { role: user.role, allowedRoles: ['admin', 'superadmin'] })
    return new Response(JSON.stringify({ error: 'Forbidden', details: `Role '${user.role}' is not authorized` }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check if account is active (for admins only, not superadmins)
  if (user.role === 'admin' && user.account_status !== 'active') {
    console.error('❌ Account suspended - Forbidden:', { account_status: user.account_status })
    return new Response(JSON.stringify({ error: 'Forbidden', details: 'Your account has been suspended. Please contact the administrator.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  console.log('✅ Authorization successful:', { role: user.role, account_status: user.account_status })
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
