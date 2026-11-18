import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/verify-admin
 * Strict server-side RBAC verification for Admin Portal login
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({
        allowed: false,
        error: 'Authentication failed: Invalid session or token.'
      }, { status: 401 })
    }

    // Query database with service-role (bypasses RLS) to get verified role & status
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, account_status')
      .eq('id', user.id)
      .maybeSingle()

    if (error || !profile) {
      console.error('❌ Failed to fetch profile in verify-admin:', error?.message)
      return NextResponse.json({
        allowed: false,
        error: 'User profile not found in system database.'
      }, { status: 404 })
    }

    console.log('🛡️ RBAC verify-admin check for:', profile.email, 'Role:', profile.role, 'Status:', profile.account_status)

    // STRICT ROLE-BASED ACCESS CONTROL (RBAC)
    if (profile.role !== 'admin') {
      let message = 'Access Denied: Administrator role required.'
      if (profile.role === 'student') {
        message = 'Access Denied: Student accounts cannot access the Admin Portal. Please use the Student LMS portal at https://students.aagajfoundation.in.'
      } else if (profile.role === 'superadmin') {
        message = 'Access Denied: Superadmin accounts must use the Superadmin Portal at /superadmin/login.'
      } else if (profile.role === 'school') {
        message = 'Access Denied: School partner accounts must use the School Portal at /school-portal/login.'
      }

      console.warn(`⛔ RBAC Blocked: ${profile.email} (Role: ${profile.role}) attempted Admin Portal access`)

      return NextResponse.json({
        allowed: false,
        role: profile.role,
        error: message
      }, { status: 403 })
    }

    // Check account status
    if (profile.account_status !== 'active') {
      console.warn(`⛔ Suspended Admin attempted login: ${profile.email}`)
      return NextResponse.json({
        allowed: false,
        role: profile.role,
        error: 'Access Denied: Your administrator account has been suspended. Please contact the Superadmin.'
      }, { status: 403 })
    }

    console.log(`✅ RBAC Verified: ${profile.email} authorized as Admin`)

    return NextResponse.json({
      allowed: true,
      role: 'admin',
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      }
    })

  } catch (err: any) {
    console.error('💥 Error in /api/auth/verify-admin:', err)
    return NextResponse.json({
      allowed: false,
      error: err.message || 'Internal server error during authentication verification.'
    }, { status: 500 })
  }
}
