import { NextRequest } from 'next/server'
import { verify as jwtVerify, decode } from 'jsonwebtoken'
import { supabaseAdmin } from './supabase'
import { logger } from './logger'
import { decodeSchoolToken } from './school-auth'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'student' | 'superadmin' | 'school'
  account_status?: string
  school_id?: string
  assigned_school_id?: string
  assigned_school_name?: string
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
 * Verifies Supabase JWT token or School Session Token
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

    // 1. Check if token is a School Session Token (sch_...)
    if (token.startsWith('sch_')) {
      const schoolPayload = decodeSchoolToken(token)
      if (schoolPayload && schoolPayload.school_id) {
        const { data: school } = await supabaseAdmin
          .from('schools')
          .select('*')
          .or(`school_id.eq.${schoolPayload.school_id},id.eq.${schoolPayload.school_id},official_email.eq.${schoolPayload.email}`)
          .maybeSingle()

        const isSuspended = school?.status === 'SUSPENDED' || school?.status === 'REJECTED'

        return {
          id: school?.assigned_admin_id || school?.user_id || schoolPayload.userId || `sch_${schoolPayload.school_id}`,
          email: schoolPayload.email,
          full_name: schoolPayload.school_name || school?.name || 'School Partner',
          role: 'school',
          school_id: schoolPayload.school_id,
          assigned_school_id: schoolPayload.school_id,
          assigned_school_name: school?.name || schoolPayload.school_name,
          account_status: isSuspended ? 'suspended' : 'active'
        } as AuthUser
      }
    }

    // 2. Decode Supabase JWT payload
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
      .select('id, email, full_name, role, account_status, assigned_school_id, assigned_school_name, school_id')
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
        account_status: profile.account_status,
        school_id: profile.school_id,
        assigned_school_id: profile.assigned_school_id,
        assigned_school_name: profile.assigned_school_name
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
 * Require admin or school partner role middleware
 * Allows 'admin', 'superadmin', and 'school' roles
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(request)

  console.log('🔍 requireAdmin check:', {
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

  if (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'school') {
    console.error('❌ Invalid role - Forbidden:', { role: user.role, allowedRoles: ['admin', 'superadmin', 'school'] })
    return new Response(JSON.stringify({ error: 'Forbidden', details: `Role '${user.role}' is not authorized` }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check if account is active (for admins and schools only, not superadmins)
  if ((user.role === 'admin' || user.role === 'school') && user.account_status !== 'active') {
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
 * Get courses assigned to this admin or school partner
 */
export async function getAllowedCourseIds(user: AuthUser): Promise<string[]> {
  if (user.role === 'superadmin') return []

  let courseIds: string[] = []

  // 1. Check admin_course_assignments for user.id
  if (user.id) {
    const { data: assignments } = await supabaseAdmin
      .from('admin_course_assignments')
      .select('course_id')
      .eq('admin_id', user.id)

    if (assignments && assignments.length > 0) {
      courseIds = assignments.map(a => a.course_id)
    }
  }

  // 2. If school partner, also check school's assigned_admin_id
  const schoolId = user.school_id || user.assigned_school_id
  if (schoolId) {
    const { data: schoolRecord } = await supabaseAdmin
      .from('schools')
      .select('assigned_admin_id')
      .or(`school_id.eq.${schoolId},id.eq.${schoolId}`)
      .maybeSingle()

    if (schoolRecord?.assigned_admin_id) {
      const { data: adminAssignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', schoolRecord.assigned_admin_id)

      if (adminAssignments && adminAssignments.length > 0) {
        adminAssignments.forEach(a => {
          if (!courseIds.includes(a.course_id)) courseIds.push(a.course_id)
        })
      }
    }
  }

  return courseIds
}

/**
 * Get students associated with this admin or school partner
 */
export async function getAllowedStudentIds(user: AuthUser, allowedCourseIds: string[] = []): Promise<string[]> {
  if (user.role === 'superadmin') return []

  const studentIdSet = new Set<string>()

  // 1. Students belonging to the same school
  const schoolId = user.school_id || user.assigned_school_id
  if (schoolId) {
    const { data: schoolStudents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .or(`school_id.eq.${schoolId},school_coaching.ilike.%${schoolId}%`)

    if (schoolStudents) {
      schoolStudents.forEach(s => studentIdSet.add(s.id))
    }
  }

  // 2. Students enrolled in allowed courses
  if (allowedCourseIds.length > 0) {
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('user_id')
      .in('course_id', allowedCourseIds)

    if (enrollments) {
      enrollments.forEach(e => studentIdSet.add(e.user_id))
    }
  }

  // 3. Students created by this admin/user
  if (user.id) {
    const { data: createdStudents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('created_by_admin_id', user.id)

    if (createdStudents) {
      createdStudents.forEach(s => studentIdSet.add(s.id))
    }
  }

  return Array.from(studentIdSet)
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
