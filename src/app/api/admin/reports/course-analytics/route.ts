import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/reports/course-analytics
 * Get course engagement and completion analytics
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')

    // Get admin's assigned courses
    let allowedCourseIds: string[] = []
    
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      allowedCourseIds = assignments?.map(a => a.course_id) || []
    }

    if (courseId) {
      // For admins, verify access to this course
      if (authResult.role === 'admin') {
        if (allowedCourseIds.length === 0 || !allowedCourseIds.includes(courseId)) {
          return NextResponse.json(
            { success: false, error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      // Get specific course analytics
      const [course, weeks, enrollments, certificates] = await Promise.all([
        supabaseAdmin
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single(),
        
        supabaseAdmin
          .from('weeks')
          .select('*, videos(*)')
          .eq('course_id', courseId),
        
        // Get enrollments for this course
        supabaseAdmin
          .from('enrollments')
          .select('user_id')
          .eq('course_id', courseId),
        
        supabaseAdmin
          .from('certificates')
          .select('*')
          .eq('course_id', courseId)
      ])

      const uniqueStudents = new Set(
        enrollments.data?.map(e => e.user_id) || []
      ).size

      const totalVideos = weeks.data?.reduce(
        (sum, week) => sum + (week.videos?.length || 0), 0
      ) || 0

      return NextResponse.json({
        success: true,
        data: {
          course: course.data,
          stats: {
            total_weeks: weeks.data?.length || 0,
            total_videos: totalVideos,
            enrolled_students: uniqueStudents,
            certificates_issued: certificates.data?.length || 0,
            completion_rate: uniqueStudents > 0 ? 
              Math.round((certificates.data?.length || 0) / uniqueStudents * 100) : 0
          },
          weeks: weeks.data?.map(week => ({
            id: week.id,
            title: week.title,
            week_number: week.week_number,
            video_count: week.videos?.length || 0
          }))
        }
      })

    } else {
      // Get all courses analytics
      // For admins, only show their assigned courses
      let coursesQuery = supabaseAdmin
        .from('courses')
        .select('id, title, status')

      if (authResult.role === 'admin') {
        if (allowedCourseIds.length === 0) {
          return NextResponse.json({
            success: true,
            data: [],
            count: 0
          })
        }
        coursesQuery = coursesQuery.in('id', allowedCourseIds)
      }

      const { data: courses } = await coursesQuery

      const analytics = []

      for (const course of courses || []) {
        const [weeks, certificates] = await Promise.all([
          supabaseAdmin
            .from('weeks')
            .select('id, videos(id)')
            .eq('course_id', course.id),
          
          supabaseAdmin
            .from('certificates')
            .select('id')
            .eq('course_id', course.id)
        ])

        const totalVideos = weeks.data?.reduce(
          (sum, week) => sum + (week.videos?.length || 0), 0
        ) || 0

        analytics.push({
          ...course,
          weeks_count: weeks.data?.length || 0,
          videos_count: totalVideos,
          certificates_issued: certificates.data?.length || 0
        })
      }

      return NextResponse.json({
        success: true,
        data: analytics,
        count: analytics.length
      })
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
