import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/reports/overview
 * Get overall system statistics
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    console.log('📊 Fetching overview statistics...')

    // Get all statistics in parallel
    const [
      studentsResult,
      coursesResult,
      tasksResult,
      projectsResult,
      ticketsResult,
      certificatesResult,
      submissionsStatsResult,
      taskSubmissionsResult
    ] = await Promise.all([
      // Students stats - Using profiles table with role check
      supabase.from('profiles').select('id, account_status, created_at').eq('role', 'student'),

      // Courses stats - handle missing status column gracefully
      supabase.from('courses').select('id'),

      // Tasks stats
      supabase.from('tasks').select('id, status'),

      // Projects stats
      supabase.from('projects').select('id, status'),

      // Tickets stats
      supabase.from('tickets').select('id, status, priority'),

      // Certificates stats
      supabase.from('certificates').select('id, issued_at'),

      // Points/Scores from task submissions for avg score
      supabase.from('task_submissions').select('points_awarded').not('points_awarded', 'is', null),

      // Task submissions needing evaluation (pending/submitted)
      supabase.from('task_submissions').select('id, status')
    ])

    // Check for errors in any query
    const errors = [
      { name: 'students', result: studentsResult },
      { name: 'courses', result: coursesResult },
      { name: 'tasks', result: tasksResult },
      { name: 'projects', result: projectsResult },
      { name: 'tickets', result: ticketsResult },
      { name: 'certificates', result: certificatesResult },
      { name: 'submissions_stats', result: submissionsStatsResult },
      { name: 'task_submissions', result: taskSubmissionsResult }
    ].filter(r => r.result.error)

    if (errors.length > 0) {
      console.error('❌ Errors in statistics queries:', errors.map(e => ({
        table: e.name,
        error: e.result.error?.message
      })))
    }

    // Calculate students stats
    let students = studentsResult.data || []
    
    // Map account_status to status for compatibility
    students = students.map((s: any) => ({
      ...s,
      status: s.account_status || 'active'
    }))

    const activeStudents = students.filter((s: any) => s.status === 'active').length
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newStudentsThisWeek = students.filter((s: any) =>
      s.created_at && new Date(s.created_at) > oneWeekAgo
    ).length

    // Calculate courses stats
    const courses = coursesResult.data || []
    const activeCourses = courses.length  // Count total courses

    // Calculate tasks stats
    const tasks = tasksResult.data || []
    const activeTasks = tasks.filter(t => t.status === 'active').length

    // Calculate task submissions needing evaluation
    const taskSubmissions = taskSubmissionsResult.data || []
    const pendingEvaluations = taskSubmissions.filter(s => 
      s.status === 'pending' || s.status === 'submitted'
    ).length

    // Calculate projects stats
    const projects = projectsResult.data || []
    const submittedProjects = projects.filter(p => p.status === 'submitted').length
    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length
    const approvedProjects = projects.filter(p => p.status === 'approved').length
    const pendingProjects = submittedProjects + inProgressProjects // Both need review

    // Calculate tickets stats
    const tickets = ticketsResult.data || []
    const openTickets = tickets.filter(t => t.status === 'open').length
    const urgentTickets = tickets.filter(t => t.priority === 'urgent').length

    // Calculate avg completion (students with certificates / total students)
    const certificates = certificatesResult.data || []
    const avgCompletion = students.length > 0 ?
      Math.round((certificates.length / students.length) * 100) : 0

    // Calculate avg task score
    const submissionsWithPoints = submissionsStatsResult.data || []
    const totalPoints = submissionsWithPoints.reduce((sum: number, s: any) => sum + (s.points_awarded || 0), 0)
    const avgScore = submissionsWithPoints.length > 0 ?
      Math.round(totalPoints / submissionsWithPoints.length) : 0

    // Calculate certificates this month
    const certificatesThisMonth = certificates.filter((c: any) => {
      const issued = new Date(c.issued_at)
      const now = new Date()
      return issued.getMonth() === now.getMonth() &&
        issued.getFullYear() === now.getFullYear()
    }).length

    const overview = {
      students: {
        total: students.length,
        active: activeStudents,
        inactive: students.length - activeStudents,
        new_this_week: newStudentsThisWeek,
        avg_completion: avgCompletion
      },
      courses: {
        total: courses.length,
        active: activeCourses,
        draft: 0
      },
      tasks: {
        total: tasks.length,
        active: activeTasks,
        pending_evaluations: pendingEvaluations,
        avg_score: avgScore
      },
      projects: {
        total: projects.length,
        submitted: submittedProjects,
        in_progress: inProgressProjects,
        approved: approvedProjects,
        pending_review: pendingProjects
      },
      tickets: {
        total: tickets.length,
        open: openTickets,
        urgent: urgentTickets,
        resolved: tickets.filter(t => t.status === 'resolved').length
      },
      certificates: {
        total: certificates.length,
        issued_this_month: certificatesThisMonth
      }
    }

    console.log('✅ Overview statistics calculated:', {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalTasks: tasks.length
    })

    return NextResponse.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /reports/overview:', {
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
