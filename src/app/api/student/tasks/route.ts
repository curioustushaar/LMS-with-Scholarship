import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/student/tasks
 * Get all tasks for the authenticated student
 * Filters by student's enrolled courses and domain
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const course_id = searchParams.get('course_id')
    const status = searchParams.get('status') || 'active'

    console.log('📥 Fetching tasks for student:', {
      student_id: authResult.id,
      course_id,
      status
    })

    // Get student's enrolled courses from enrollments table
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('user_id', authResult.id)

    if (enrollError) {
      console.error('❌ Failed to fetch enrollments:', enrollError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch enrollments', details: enrollError.message },
        { status: 500 }
      )
    }

    const enrolledCourseIds = enrollments?.map(e => e.course_id) || []

    console.log('📚 Student enrolled in courses:', enrolledCourseIds)

    if (enrolledCourseIds.length === 0) {
      // No enrollments, return empty
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No enrolled courses found'
      })
    }

    // Build query for tasks from enrolled courses
    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        courses(id, title, domain),
        task_submissions!left(id, status, points_awarded, feedback, submitted_at, evaluated_at, user_id)
      `)
      .eq('status', status)
      .in('course_id', enrolledCourseIds)
      .order('deadline', { ascending: true })

    // Filter by specific course if requested
    if (course_id) {
      query = query.eq('course_id', course_id)
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) {
      console.error('❌ Failed to fetch tasks:', tasksError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tasks', details: tasksError.message },
        { status: 500 }
      )
    }

    // Filter submissions to only show current student's submissions
    const tasksWithUserSubmissions = tasks?.map(task => {
      const userSubmission = task.task_submissions?.find(
        (sub: any) => sub.user_id === authResult.id
      )
      return {
        ...task,
        task_submissions: userSubmission ? [userSubmission] : [] // Keep as array for consistency
      }
    })

    console.log(`✅ Found ${tasksWithUserSubmissions?.length || 0} tasks for student`)

    return NextResponse.json({
      success: true,
      data: tasksWithUserSubmissions || [],
      count: tasksWithUserSubmissions?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /student/tasks:', error.message)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
