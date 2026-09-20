import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/settings/email-templates
 * Get all email templates
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('template_name')

    if (error) {
      console.error('❌ Error fetching email templates:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('💥 Unexpected error GET /settings/email-templates:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/settings/email-templates
 * Update email template
 */
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id
    const body = await request.json()
    const { template_name, subject, bodyText } = body

    if (!template_name) {
      return NextResponse.json({ success: false, error: 'Template name is required' }, { status: 400 })
    }

    const updateData: any = {
      updated_by: userId,
      updated_at: new Date().toISOString()
    }

    if (subject !== undefined) updateData.subject = subject
    if (bodyText !== undefined) updateData.body = bodyText

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update(updateData)
      .eq('template_name', template_name)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating email template:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, message: 'Template updated successfully' })
  } catch (err: any) {
    console.error('💥 Unexpected error PATCH /settings/email-templates:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
