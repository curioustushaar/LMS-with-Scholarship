import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * POST /api/admin/courses
 * Create new course
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      thumbnail_url, 
      duration_weeks, 
      level
    } = body

    console.log('📝 Creating course with data:', {
      title,
      duration_weeks,
      level
    })

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required', success: false },
        { status: 400 }
      )
    }

    const courseData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      thumbnail_url: thumbnail_url || null,
      duration_weeks: duration_weeks || null,
      level: level || 'beginner',
      status: body.status || 'draft'
    }

    console.log('🔄 Inserting course into database')

    // Build insert payload
    const insertPayload: any = {
      title: courseData.title,
      description: courseData.description,
      thumbnail_url: courseData.thumbnail_url,
      duration_weeks: courseData.duration_weeks,
      level: courseData.level,
      status: courseData.status,
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('❌ Database insert error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        { success: false, error: 'Failed to create course', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Course created successfully:', data.id)

    return NextResponse.json({
      success: true,
      data,
      message: 'Course created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /courses:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/courses
 * Get all courses
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    console.log('📥 Fetching courses with filters:', { status })

    let query = supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: error.message, success: false },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${data?.length || 0} courses`)

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /courses:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, success: false },
      { status: 500 }
    )
  }
}
