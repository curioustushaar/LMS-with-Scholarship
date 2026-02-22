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
    
    console.log('📥 Fetching profile for user:', userId)
    
    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('❌ Error fetching profile:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('✅ Profile fetched:', data)

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

    console.log('📝 Updating profile for user:', userId, body)

    const allowed: any = {}
    if (body.full_name !== undefined) allowed.full_name = body.full_name
    // Email is read-only from auth.users, don't allow updating via settings
    if (body.profile_image_url !== undefined) allowed.profile_image_url = body.profile_image_url
    // Phone is optional
    if (body.phone !== undefined) allowed.phone = body.phone

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields provided' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(allowed)
      .eq('id', userId)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('❌ Error updating profile:', error.message)
      // Friendly handling for missing column (common migration issue)
      const msg = error.message || ''
      
      if (msg.includes('phone') && (msg.includes('column') || msg.includes('schema cache'))) {
        return NextResponse.json({
          success: false,
          error: 'Database missing phone column. Run add-phone-column-to-profiles.sql from Supabase SQL Editor.'
        }, { status: 500 })
      }
      
      if (msg.includes('profile_image_url') || msg.includes('column') && msg.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Database missing column. Run fix-add-profile-image-column.sql in the project root (or add the column in Supabase) and then run NOTIFY pgrst, \"reload schema\".'
        }, { status: 500 })
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('✅ Profile updated successfully:', data)

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('💥 Unexpected error PATCH /settings:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}
