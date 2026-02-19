import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/settings/notifications
 * Get notification preferences for current admin
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching notification preferences:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Return default values if no preferences exist
    const preferences = data || {
      new_student_registration: true,
      new_task_submission: true,
      project_pending_approval: true,
      new_support_ticket: true,
      certificate_approval_request: true
    }

    return NextResponse.json({ success: true, data: preferences })
  } catch (err: any) {
    console.error('💥 Unexpected error GET /settings/notifications:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/settings/notifications
 * Save notification preferences
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id
    const body = await request.json()

    const preferences = {
      user_id: userId,
      new_student_registration: body.new_student_registration ?? true,
      new_task_submission: body.new_task_submission ?? true,
      project_pending_approval: body.project_pending_approval ?? true,
      new_support_ticket: body.new_support_ticket ?? true,
      certificate_approval_request: body.certificate_approval_request ?? true,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .upsert(preferences, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('❌ Error saving notification preferences:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, message: 'Preferences saved successfully' })
  } catch (err: any) {
    console.error('💥 Unexpected error POST /settings/notifications:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
