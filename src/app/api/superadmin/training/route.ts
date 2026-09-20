import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

export const dynamic = 'force-dynamic'

// GET
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin.from('training_programs').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] })
  }
}

// POST
export async function POST(request: Request) {
  const { authorized, userId } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, ...rest } = body
    if (!title?.trim()) return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('training_programs')
      .insert({ title: title.trim(), ...rest, status: rest.status || 'active', created_by: userId || null })
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
      .from('training_programs')
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

    const { error } = await supabaseAdmin.from('training_programs').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Training program deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
