import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Verify superadmin (reusable)
async function verifySuperadmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token || token.length < 20) return false

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) return false

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'superadmin'
  } catch {
    return false
  }
}

// GET /api/superadmin/cms?section=home_hero
export async function GET(request: Request) {
  const isAuthed = await verifySuperadmin(request)
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    let query = supabaseAdmin
      .from('site_content')
      .select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })

    if (section) query = query.eq('section', section)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('CMS GET error:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}

// POST /api/superadmin/cms - Create or update content
export async function POST(request: Request) {
  const isAuthed = await verifySuperadmin(request)
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { section, content_key, content_value, content_type, sort_order } = body

    if (!section || !content_key) {
      return NextResponse.json({ success: false, error: 'section and content_key are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_content')
      .upsert({
        section,
        content_key,
        content_value: content_value || '',
        content_type: content_type || 'text',
        sort_order: sort_order || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'section,content_key' })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('CMS POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/cms - Bulk update section content
export async function PUT(request: Request) {
  const isAuthed = await verifySuperadmin(request)
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { section, items } = body // items: Array<{content_key, content_value}>

    if (!section || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'section and items array are required' }, { status: 400 })
    }

    const upsertData = items.map((item: any, index: number) => ({
      section,
      content_key: item.content_key,
      content_value: item.content_value || '',
      content_type: item.content_type || 'text',
      sort_order: item.sort_order || index,
      updated_at: new Date().toISOString(),
    }))

    const { data, error } = await supabaseAdmin
      .from('site_content')
      .upsert(upsertData, { onConflict: 'section,content_key' })
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('CMS PUT error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/cms?id=xxx
export async function DELETE(request: Request) {
  const isAuthed = await verifySuperadmin(request)
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('site_content')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Content deleted' })
  } catch (error: any) {
    console.error('CMS DELETE error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
