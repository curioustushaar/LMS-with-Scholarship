import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse, successResponse } from '@/lib/superadmin-auth'

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `School@${code}${digits}`
}

// POST /api/superadmin/schools/[id]/reset-password
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id

    // 1. Fetch school to get email / user_id
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('*')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const targetEmail = school?.official_email?.toLowerCase().trim()
    const newTempPassword = generateTemporaryPassword()

    let authUserId = school?.user_id

    if (authUserId) {
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: newTempPassword,
        email_confirm: true,
      })
    } else if (targetEmail) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
      const match = userList?.users?.find((u) => u.email?.toLowerCase() === targetEmail)
      if (match) {
        authUserId = match.id
        await supabaseAdmin.auth.admin.updateUserById(match.id, {
          password: newTempPassword,
          email_confirm: true,
        })
      } else {
        const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: newTempPassword,
          email_confirm: true,
          user_metadata: {
            role: 'school',
            school_id: school?.school_id || schoolIdentifier,
            full_name: school?.name || 'School Partner',
          },
        })
        if (newUser?.user) {
          authUserId = newUser.user.id
        }
      }
    }

    if (authUserId) {
      await supabaseAdmin.from('profiles').upsert({
        id: authUserId,
        email: targetEmail,
        full_name: school?.name || 'School Partner',
        role: 'school',
        school_id: school?.school_id || schoolIdentifier,
        account_status: 'active',
        updated_at: new Date().toISOString(),
      })
      await supabaseAdmin
        .from('schools')
        .update({ user_id: authUserId })
        .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
    }

    // 2. Mark is_first_login = true in public.schools
    await supabaseAdmin
      .from('schools')
      .update({ is_first_login: true, updated_at: new Date().toISOString() })
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)

    return NextResponse.json({
      success: true,
      message: 'School password reset successfully!',
      credentials: {
        school_id: school?.school_id || schoolIdentifier,
        school_name: school?.name || 'School Partner',
        login_email: targetEmail || 'school@example.com',
        temporary_password: newTempPassword,
        reset_at: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Reset password exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
