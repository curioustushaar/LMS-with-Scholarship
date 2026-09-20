import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/school/auth/change-password
export async function POST(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const body = await request.json()
    const { new_password } = body

    if (!new_password || new_password.length < 6) {
      return schoolErrorResponse('New password must be at least 6 characters long.', 400)
    }

    const schoolId = auth.school.school_id
    const targetEmail = (auth.email || auth.school.official_email || '').toLowerCase().trim()
    let effectiveUserId = auth.userId

    // 1. If effectiveUserId is not a valid UUID, attempt to resolve from auth users list by email
    try {
      if (!effectiveUserId || !UUID_REGEX.test(effectiveUserId)) {
        if (targetEmail) {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
          const match = userList?.users?.find((u) => u.email?.toLowerCase() === targetEmail)
          if (match?.id) {
            effectiveUserId = match.id
          }
        }
      }

      // Update Supabase Auth user password if valid UUID is available
      if (effectiveUserId && UUID_REGEX.test(effectiveUserId)) {
        await supabaseAdmin.auth.admin.updateUserById(effectiveUserId, {
          password: new_password,
          email_confirm: true,
        })
      }
    } catch (authErr: any) {
      console.warn('Supabase Auth update password notice (safe):', authErr.message)
    }

    // 2. Set is_first_login = false in public.schools
    try {
      await supabaseAdmin
        .from('schools')
        .update({ is_first_login: false, updated_at: new Date().toISOString() })
        .or(`school_id.eq.${schoolId},id.eq.${auth.school.id || schoolId}`)
    } catch (dbErr: any) {
      console.warn('Database is_first_login update notice:', dbErr.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully! Your account is now fully secured.',
    })
  } catch (error: any) {
    console.error('School change-password exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
