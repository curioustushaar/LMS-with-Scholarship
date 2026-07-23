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
      level,
      assigned_admin_ids // New: For superadmin to assign courses to admins
    } = body

    console.log('📝 Creating course with data:', {
      title,
      duration_weeks,
      level,
      assigned_admins: assigned_admin_ids
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
      level: level ? level.toLowerCase() : 'beginner',
      status: typeof body.status === 'string'
        ? body.status.toLowerCase()
        : body.status === true
          ? 'active'
          : 'draft',
      created_by: authResult.id
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
      created_by: courseData.created_by
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

    // If superadmin and admin IDs provided, assign courses to admins
    if (authResult.role === 'superadmin' && assigned_admin_ids && Array.isArray(assigned_admin_ids) && assigned_admin_ids.length > 0) {
      const assignments = assigned_admin_ids.map((admin_id: string) => ({
        admin_id,
        course_id: data.id,
        assigned_by: authResult.id
      }))

      const { error: assignError } = await supabaseAdmin
        .from('admin_course_assignments')
        .insert(assignments)

      if (assignError) {
        console.warn('⚠️ Failed to assign course to admins:', assignError.message)
        // Don't fail the whole request, just log warning
      } else {
        console.log(`✅ Course assigned to ${assigned_admin_ids.length} admin(s)`)
      }
    }

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

    console.log('📥 Fetching courses with filters:', { status, role: authResult.role })

    let query = supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    // If admin (not superadmin), filter by assigned courses only
    if (authResult.role === 'admin') {
      // Get admin's assigned course IDs
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const assignedCourseIds = assignments?.map(a => a.course_id) || []
      
      if (assignedCourseIds.length === 0) {
        // Admin has no assigned courses
        console.log('⚠️ Admin has no assigned courses')
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No courses assigned to you yet'
        })
      }

      query = query.in('id', assignedCourseIds)
    }

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
