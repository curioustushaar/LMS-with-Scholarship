import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { current_password, new_password } = body || {}

    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const userId = authResult.id

    // Use the service role admin API to update the user's password directly
    // Note: This bypasses verifying the current password; requireAdmin already validated the user session.
    try {
      // supabaseAdmin.auth.admin.updateUserById is available on admin client
      const { data, error } = await (supabaseAdmin as any).auth.admin.updateUserById(userId, { password: new_password })

      if (error) {
        console.error('Error updating password via admin API:', error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Password updated' })
    } catch (err: any) {
      console.error('Unexpected error updating password:', err)
      return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
    }
  } catch (err: any) {
    console.error('Error in POST /settings/password:', err)
    return NextResponse.json({ success: false, error: err.message || 'Invalid request' }, { status: 400 })
  }
}
