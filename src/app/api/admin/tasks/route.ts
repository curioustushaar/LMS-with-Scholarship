import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/tasks
 * Create new task
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    console.log('📝 Creating task with data:', {
      title: body.title,
      course_id: body.course_id,
      due_date: body.due_date,
      max_points: body.max_points
    })

    const { title, description, due_date, course_id, max_points, week_id } = body

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required', success: false },
        { status: 400 }
      )
    }

    if (!course_id) {
      return NextResponse.json(
        { error: 'Course ID is required', success: false },
        { status: 400 }
      )
    }

    // If admin (not superadmin), verify access to this course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied. You can only create tasks for your assigned courses.', success: false },
          { status: 403 }
        )
      }
    }

    // Validate week_id if provided (must be valid UUID format, not "week-1" strings)
    const validWeekId = week_id && typeof week_id === 'string' && week_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? week_id : null

    // Get course details to inherit domain
    const { data: courseData, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('domain')
      .eq('id', course_id)
      .single()

    if (courseError) {
      console.error('❌ Failed to fetch course details:', courseError.message)
    }

    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      deadline: due_date ? new Date(due_date).toISOString() : null,
      week_id: validWeekId,
      course_id,
      domain: courseData?.domain || null, // Inherit domain from course
      max_points: max_points || 100,
      status: 'active',
      task_type: 'assignment', // Default task type
      created_by: authResult.id
    }

    console.log('🔄 Inserting task into database:', taskData)

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert([taskData])
      .select() // Use wildcard to avoid schema cache issues
      .single()

    if (error) {
      console.error('❌ Database insert error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to create task',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log('✅ Task created successfully:', data.id)

    return NextResponse.json({
      success: true,
      data,
      message: 'Task created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /tasks:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/tasks
 * Get all tasks
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const course_id = searchParams.get('course_id')
    const domain = searchParams.get('domain')

    console.log('📥 Fetching tasks with filters:', { status, course_id, domain, role: authResult.role })

    // For admins, filter by assigned courses
    let allowedCourseIds: string[] = []
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      allowedCourseIds = assignments?.map(a => a.course_id) || []
      
      console.log(`📚 Admin has ${allowedCourseIds.length} assigned courses`)

      if (allowedCourseIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No courses assigned to you yet'
        })
      }
    }

    let query = supabaseAdmin
      .from('tasks')
      .select('*, courses(title, domain)')
      .order('created_at', { ascending: false })

    // Filter by admin's assigned courses
    if (authResult.role === 'admin' && allowedCourseIds.length > 0) {
      query = query.in('course_id', allowedCourseIds)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (course_id) {
      query = query.eq('course_id', course_id)
    }

    if (domain) {
      query = query.eq('domain', domain)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to fetch tasks',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${data?.length || 0} tasks`)

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /tasks:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        success: false
      },
      { status: 500 }
    )
  }
}
