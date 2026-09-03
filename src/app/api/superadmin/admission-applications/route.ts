import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

// GET - List admission applications
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const admissionId = searchParams.get('admission_id')

    let query = supabaseAdmin
      .from('admission_applications')
      .select('*, admissions(program_name)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (admissionId) query = query.eq('admission_id', admissionId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] })
  }
}

// PUT - Update application status
export async function PUT(request: Request) {
  const { authorized, userId } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('admission_applications')
      .update({
        status,
        reviewed_by: userId || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
