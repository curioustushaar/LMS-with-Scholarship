import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/reports/student-progress
 * Get detailed student progress analytics
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    // Get admin's assigned courses and student IDs
    let allowedStudentIds: string[] = []
    let courseIds: string[] = []
    
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      courseIds = assignments?.map(a => a.course_id) || []

      if (courseIds.length > 0) {
        const { data: enrollments } = await supabaseAdmin
          .from('enrollments')
          .select('user_id')
          .in('course_id', courseIds)

        allowedStudentIds = Array.from(new Set(enrollments?.map(e => e.user_id) || []))
      }
    }

    if (userId) {
      // For admins, verify access to this student
      if (authResult.role === 'admin') {
        if (allowedStudentIds.length === 0 || !allowedStudentIds.includes(userId)) {
          return NextResponse.json(
            { success: false, error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      // Get specific student progress
      const [
        videoProgress,
        taskSubmissions,
        projects,
        badges,
        certificates
      ] = await Promise.all([
        supabaseAdmin
          .from('video_progress')
          .select('*, videos(title, duration_minutes)')
          .eq('user_id', userId),

        supabaseAdmin
          .from('task_submissions')
          .select('*, tasks(title, max_points)')
          .eq('user_id', userId),

        supabaseAdmin
          .from('projects')
          .select('*')
          .eq('user_id', userId),

        supabaseAdmin
          .from('user_badges')
          .select('*, badges(*)')
          .eq('user_id', userId),

        supabaseAdmin
          .from('certificates')
          .select('*, courses(title)')
          .eq('user_id', userId)
      ])

      // Calculate stats
      const totalVideos = videoProgress.data?.length || 0
      const completedVideos = videoProgress.data?.filter(v => v.completed).length || 0
      const totalTasks = taskSubmissions.data?.length || 0
      const completedTasks = taskSubmissions.data?.filter(t =>
        t.status === 'approved' || t.status === 'reviewed'
      ).length || 0
      const totalPoints = taskSubmissions.data?.reduce((sum, t) =>
        sum + (t.points_awarded || 0), 0
      ) || 0

      return NextResponse.json({
        success: true,
        data: {
          user_id: userId,
          video_progress: {
            total: totalVideos,
            completed: completedVideos,
            completion_rate: totalVideos > 0 ?
              Math.round((completedVideos / totalVideos) * 100) : 0
          },
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            completion_rate: totalTasks > 0 ?
              Math.round((completedTasks / totalTasks) * 100) : 0,
            total_points: totalPoints
          },
          projects: {
            total: projects.data?.length || 0,
            approved: projects.data?.filter(p => p.status === 'approved').length || 0
          },
          badges: {
            total: badges.data?.length || 0,
            list: badges.data || []
          },
          certificates: {
            total: certificates.data?.length || 0,
            list: certificates.data || []
          }
        }
      })

    } else {
      // Get all students progress summary from profiles
      // For admins, only show students from their assigned courses
      let studentsQuery = supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')

      if (authResult.role === 'admin') {
        if (allowedStudentIds.length === 0) {
          return NextResponse.json({
            success: true,
            data: [],
            count: 0
          })
        }
        studentsQuery = studentsQuery.in('id', allowedStudentIds)
      }

      const { data: students } = await studentsQuery

      const progressData = []

      for (const student of students || []) {
        const [tasks, projects, certificates] = await Promise.all([
          supabaseAdmin
            .from('task_submissions')
            .select('status, points_awarded')
            .eq('user_id', student.id),

          supabaseAdmin
            .from('projects')
            .select('status')
            .eq('user_id', student.id),

          supabaseAdmin
            .from('certificates')
            .select('id')
            .eq('user_id', student.id)
        ])

        progressData.push({
          ...student,
          tasks_completed: tasks.data?.filter(t =>
            t.status === 'approved' || t.status === 'reviewed'
          ).length || 0,
          total_points: tasks.data?.reduce((sum, t) =>
            sum + (t.points_awarded || 0), 0
          ) || 0,
          projects_approved: projects.data?.filter(p =>
            p.status === 'approved'
          ).length || 0,
          certificates_earned: certificates.data?.length || 0
        })
      }

      return NextResponse.json({
        success: true,
        data: progressData,
        count: progressData.length
      })
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
