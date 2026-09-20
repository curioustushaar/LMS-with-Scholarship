import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

// GET /api/superadmin/navbar
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin
      .from('navbar_items')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    return NextResponse.json({ success: true, data: [] })
  }
}

// PUT - Update navbar item (visibility, order, name)
export async function PUT(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    // Bulk update: array of { id, is_visible, sort_order, name, href }
    if (Array.isArray(body)) {
      const results = []
      for (const item of body) {
        const { id, ...updates } = item
        if (!id) continue

        const { data, error } = await supabaseAdmin
          .from('navbar_items')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (!error && data) results.push(data)
      }
      return NextResponse.json({ success: true, data: results })
    }

    // Single update
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('navbar_items')
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

// POST - Create new navbar item
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, href, sort_order, is_visible, is_external } = body

    if (!name?.trim() || !href?.trim()) {
      return NextResponse.json({ success: false, error: 'Name and href are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('navbar_items')
      .insert({ name: name.trim(), href: href.trim(), sort_order: sort_order || 0, is_visible: is_visible !== false, is_external: is_external || false })
      .select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

function handleNavbarError(error: any) {
  if (error?.code === 'PGRST205' || error?.message?.includes('schema cache')) {
    return NextResponse.json({
      success: false,
      error: 'Table public.navbar_items does not exist in Supabase database yet. Please run the SQL file "migrations/RUN_THIS_IN_SUPABASE.sql" in your Supabase SQL Editor.'
    }, { status: 500 })
  }
  return NextResponse.json({ success: false, error: error.message }, { status: 500 })
}

// DELETE
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const { error } = await supabaseAdmin.from('navbar_items').delete().eq('id', id)
    if (error) return handleNavbarError(error)
    return NextResponse.json({ success: true, message: 'Navbar item deleted' })
  } catch (error: any) {
    return handleNavbarError(error)
  }
}
