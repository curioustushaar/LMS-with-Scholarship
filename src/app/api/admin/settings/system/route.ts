import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/settings/system
 * Get all system settings
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('setting_key')

    if (error) {
      console.error('❌ Error fetching system settings:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Convert array to object for easier access
    const settings: any = {}
    data?.forEach((item: any) => {
      settings[item.setting_key] = item.setting_value
    })

    return NextResponse.json({ success: true, data: settings })
  } catch (err: any) {
    console.error('💥 Unexpected error GET /settings/system:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/settings/system
 * Update system settings
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id
    const body = await request.json()

    const updates = []
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        updates.push({
          setting_key: key,
          setting_value: String(value),
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No settings provided' }, { status: 400 })
    }

    // Upsert all settings
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .upsert(updates, { onConflict: 'setting_key' })
      .select()

    if (error) {
      console.error('❌ Error updating system settings:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, message: 'Settings saved successfully' })
  } catch (err: any) {
    console.error('💥 Unexpected error POST /settings/system:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
