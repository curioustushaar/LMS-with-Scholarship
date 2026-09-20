import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/tasks/[id]
 * Get single task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📥 Fetching task:', id)

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*, courses(title, domain)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to fetch task',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to task's course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', data.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied to this task', success: false },
          { status: 403 }
        )
      }
    }

    console.log('✅ Task fetched successfully:', data.id)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /tasks/[id]:', {
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
 * PUT /api/admin/tasks/[id]
 * Update task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params
    const body = await request.json()

    console.log('📝 Updating task:', id, {
      title: body.title,
      course_id: body.course_id,
      deadline: body.deadline,
      max_points: body.max_points
    })

    const { title, description, deadline, course_id, max_points, week_id, status } = body

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
          { error: 'Access denied. You can only update tasks for your assigned courses.', success: false },
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

    const updateData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      deadline: deadline || null,
      week_id: validWeekId,
      course_id,
      domain: courseData?.domain || null,
      max_points: max_points || 100,
      status: status ? status.toLowerCase() : 'active',
    }

    console.log('🔄 Updating task in database:', updateData)

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database update error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to update task',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log('✅ Task updated successfully:', data.id)

    return NextResponse.json({
      success: true,
      data,
      message: 'Task updated successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in PUT /tasks/[id]:', {
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
 * DELETE /api/admin/tasks/[id]
 * Delete task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('🗑️ Deleting task:', id)

    // First, get the task to check course access
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('course_id')
      .eq('id', id)
      .single()

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to task's course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', task.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied. You can only delete tasks for your assigned courses.', success: false },
          { status: 403 }
        )
      }
    }

    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database delete error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to delete task',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log('✅ Task deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in DELETE /tasks/[id]:', {
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
