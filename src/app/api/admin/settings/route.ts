import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/settings
 * PATCH /api/admin/settings
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, profile_image_url, role')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('❌ Error fetching profile:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('💥 Unexpected error GET /settings:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id
    const body = await request.json()

    const allowed: any = {}
    if (body.full_name) allowed.full_name = body.full_name
    if (body.email) allowed.email = body.email
    if (body.phone) allowed.phone = body.phone
    if (body.profile_image_url) allowed.profile_image_url = body.profile_image_url

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields provided' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(allowed)
      .eq('id', userId)
      .select('id, email, full_name, phone, profile_image_url, role')
      .maybeSingle()

    if (error) {
      console.error('❌ Error updating profile:', error.message)
      // Friendly handling for missing column (common migration issue)
      const msg = error.message || ''
      if (msg.includes('profile_image_url') || msg.includes('column') && msg.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Database missing column users.profile_image_url. Run fix-add-profile-image-column.sql in the project root (or add the column in Supabase) and then run NOTIFY pgrst, \"reload schema\".'
        }, { status: 500 })
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('💥 Unexpected error PATCH /settings:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}
