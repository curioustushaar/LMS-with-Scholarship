import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

// GET
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin.from('school_partners').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] })
  }
}

// POST
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { institution_name, ...rest } = body
    if (!institution_name?.trim()) return NextResponse.json({ success: false, error: 'Institution name is required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('school_partners')
      .insert({ institution_name: institution_name.trim(), ...rest, status: rest.status || 'active' })
      .select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT
export async function PUT(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('school_partners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { error } = await supabaseAdmin.from('school_partners').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'School partner deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
