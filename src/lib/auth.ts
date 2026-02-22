import { NextRequest } from 'next/server'
import { supabase, supabaseAdmin } from './supabase'
import { logger } from './logger'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'student' | 'superadmin'
  account_status?: string
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

    console.log('🔍 getUserFromRequest - Auth header present:', !!authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No valid auth header')
      return null
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth verification failed:', authError?.message)
      return null
    }

    console.log('✅ User authenticated:', { userId: user.id, email: user.email })

    // Get user details from public.profiles table using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, account_status')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('⚠️ Database query error:', error.message)
      // Continue with authenticated user
    }

    if (!data) {
      console.warn('⚠️ No profile found, using metadata fallback')
      // Check if user has role in metadata as fallback
      const metaRole = user.app_metadata?.role || user.user_metadata?.role || 'student'
      
      const fallbackUser = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: metaRole as 'admin' | 'student' | 'superadmin'
      } as AuthUser

      console.log('📋 Using fallback user:', { role: fallbackUser.role })
      return fallbackUser
    }

    console.log('📋 Profile found:', { role: data.role, email: data.email })
    return data as AuthUser
  } catch (error) {
    console.error('💥 Authentication error:', error)
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
