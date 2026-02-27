import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/student/projects
 * Get all projects for authenticated student
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id

    console.log('📥 Fetching projects for student:', userId)

    // First, get student's enrolled courses
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId)

    if (enrollError) {
      console.error('❌ Error fetching enrollments:', enrollError)
      return NextResponse.json(
        { error: 'Failed to fetch enrollments', details: enrollError.message, success: false },
        { status: 500 }
      )
    }

    const enrolledCourseIds = enrollments?.map(e => e.course_id) || []

    console.log('📚 Student enrolled in courses:', enrolledCourseIds)

    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No enrolled courses found'
      })
    }

    // Fetch projects from enrolled courses - projects assigned to courses
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        courses:course_id (
          id,
          title,
          description,
          domain
        ),
        project_deliverables (
          id,
          file_url,
          description,
          created_at
        )
      `)
      .in('course_id', enrolledCourseIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to fetch projects',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${data?.length || 0} projects for student from enrolled courses`)

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /student/projects:', {
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