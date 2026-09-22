import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/superadmin/notices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('notices')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'hidden') {
      query = query.eq('is_active', false)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.warn('⚠️ Supabase notices query warning:', error.message)
      return NextResponse.json({ success: true, data: [] })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Error fetching admin notices:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/notices
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      category,
      badge_text,
      description,
      content,
      file_url,
      file_type,
      file_name,
      file_size,
      is_pinned,
      is_active,
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Notice title is required' }, { status: 400 })
    }

    const newNotice = {
      title: title.trim(),
      category: category || 'General',
      badge_text: badge_text || 'NEW',
      description: description || '',
      content: content || description || '',
      file_url: file_url || null,
      file_type: file_type || (file_url?.toLowerCase().endsWith('.pdf') ? 'pdf' : file_url ? 'image/jpeg' : null),
      file_name: file_name || null,
      file_size: file_size || null,
      is_pinned: !!is_pinned,
      is_active: is_active !== false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('notices')
      .insert(newNotice)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating notice:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in POST /api/superadmin/notices:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/notices
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID is required' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('notices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating notice:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in PUT /api/superadmin/notices:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/notices
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('notices')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting notice:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notice deleted successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/superadmin/notices:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
