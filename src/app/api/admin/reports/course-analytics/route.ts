import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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

    if (courseId) {
      // Get specific course analytics
      const [course, weeks, enrollments, certificates] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single(),
        
        supabase
          .from('weeks')
          .select('*, videos(*)')
          .eq('course_id', courseId),
        
        // Count unique students who watched videos in this course
        supabase
          .from('video_progress')
          .select('user_id, videos!inner(week_id, weeks!inner(course_id))')
          .eq('videos.weeks.course_id', courseId),
        
        supabase
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
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, status')

      const analytics = []

      for (const course of courses || []) {
        const [weeks, certificates] = await Promise.all([
          supabase
            .from('weeks')
            .select('id, videos(id)')
            .eq('course_id', course.id),
          
          supabase
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
