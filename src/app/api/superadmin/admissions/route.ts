import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

// GET /api/superadmin/admissions - List all admissions programs
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin
      .from('admissions')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] })
  }
}

// POST /api/superadmin/admissions - Create admission program
export async function POST(request: Request) {
  const { authorized, userId } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { program_name, description, eligibility, duration, fee_structure, seats_available, application_deadline, status } = body

    if (!program_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Program name is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('admissions')
      .insert({
        program_name: program_name.trim(),
        description, eligibility, duration, fee_structure,
        seats_available: seats_available || 0,
        application_deadline,
        status: status || 'active',
        created_by: userId || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/admissions - Update admission program
export async function PUT(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('admissions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/admissions?id=xxx
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { error } = await supabaseAdmin.from('admissions').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true, message: 'Admission program deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
