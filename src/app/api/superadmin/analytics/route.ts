/**
 * Superadmin API - Analytics & Statistics
 * GET - Get overall system analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Verify if user is superadmin
async function verifySuperadmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return { error: 'Invalid token', status: 401 }
  }

  // Check if user is superadmin
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'superadmin') {
    return { error: 'Access denied. Superadmin only.', status: 403 }
  }

  return { user, profile }
}

/**
 * GET /api/superadmin/analytics
 * Get overall system analytics
 */
export async function GET(req: NextRequest) {
  try {
    console.log('📊 Analytics API: Request received')
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      console.error('❌ Analytics API: Auth check failed:', authCheck.error)
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }
    
    console.log('✅ Analytics API: Auth verified for user:', authCheck.user?.email)

    // Get total admins (active only, or if account_status is null)
    const { count: totalAdmins, error: adminsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
      .or('account_status.eq.active,account_status.is.null')
    
    console.log('📊 Total admins:', totalAdmins, adminsError ? `Error: ${adminsError.message}` : '')

    console.log('📊 Total admins:', totalAdmins)

    // Get total students
    const { count: totalStudents, error: studentsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
    
    console.log('📊 Total students:', totalStudents, studentsError ? `Error: ${studentsError.message}` : '')

    // Get total courses
    const { count: totalCourses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact', head: true })
    
    console.log('📊 Total courses:', totalCourses, coursesError ? `Error: ${coursesError.message}` : '')

    // Get total tasks (handle if table doesn't exist)
    let totalTasks = 0
    try {
      const { count } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact', head: true })
      totalTasks = count || 0
    } catch (e) {
      console.log('Tasks table not found or error:', e)
    }

    // Get total projects (handle if table doesn't exist)
    let totalProjects = 0
    try {
      const { count } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact', head: true })
      totalProjects = count || 0
    } catch (e) {
      console.log('Projects table not found or error:', e)
    }

    // Get total tickets (handle if table doesn't exist)
    let totalTickets = 0
    let pendingTickets = 0
    try {
      const { count: allTickets } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
      totalTickets = allTickets || 0

      const { count: pending } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
      pendingTickets = pending || 0
    } catch (e) {
      console.log('Tickets table not found or error:', e)
    }

    // Get pending projects (handle if table doesn't exist)
    let pendingProjects = 0
    try {
      const { count } = await supabaseAdmin
        .from('project_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted')
      pendingProjects = count || 0
    } catch (e) {
      console.log('Project submissions table not found or error:', e)
    }

    // Get admin performance (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentActivities } = await supabaseAdmin
      .from('admin_activities')
      .select(`
        activity_date,
        courses_added,
        students_added,
        projects_evaluated,
        tasks_created,
        tickets_resolved
      `)
      .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: false })

    // Group activities by date
    const activityByDate: any = {}
    recentActivities?.forEach((activity) => {
      const date = activity.activity_date
      if (!activityByDate[date]) {
        activityByDate[date] = {
          date,
          courses_added: 0,
          students_added: 0,
          projects_evaluated: 0,
          tasks_created: 0,
          tickets_resolved: 0
        }
      }
      activityByDate[date].courses_added += activity.courses_added || 0
      activityByDate[date].students_added += activity.students_added || 0
      activityByDate[date].projects_evaluated += activity.projects_evaluated || 0
      activityByDate[date].tasks_created += activity.tasks_created || 0
      activityByDate[date].tickets_resolved += activity.tickets_resolved || 0
    })

    // Get top performing admins
    const { data: adminProfiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'superadmin'])
      .order('created_at', { ascending: false })

    // Calculate activity stats for each admin
    const adminsWithActivity = await Promise.all(
      (adminProfiles || []).map(async (admin) => {
        const { data: activities } = await supabaseAdmin
          .from('admin_activities')
          .select('*')
          .eq('admin_id', admin.id)

        const totalStats = activities?.reduce(
          (acc, activity) => ({
            total_courses_added: acc.total_courses_added + (activity.courses_added || 0),
            total_students_added: acc.total_students_added + (activity.students_added || 0),
            total_projects_evaluated: acc.total_projects_evaluated + (activity.projects_evaluated || 0),
            total_tasks_created: acc.total_tasks_created + (activity.tasks_created || 0),
            total_tickets_resolved: acc.total_tickets_resolved + (activity.tickets_resolved || 0),
            active_days: acc.active_days + 1,
          }),
          {
            total_courses_added: 0,
            total_students_added: 0,
            total_projects_evaluated: 0,
            total_tasks_created: 0,
            total_tickets_resolved: 0,
            active_days: 0,
          }
        )

        // Get assigned students count and other assignment data
        let assignedStudentsCount = 0
        let assignedCoursesCount = 0
        let assignedTasksCount = 0
        let assignedProjectsCount = 0
        
        // Get admin's assigned courses
        const { data: courseAssignments } = await supabaseAdmin
          .from('admin_course_assignments')
          .select('course_id')
          .eq('admin_id', admin.id)
        
        if (courseAssignments && courseAssignments.length > 0) {
          const courseIds = courseAssignments.map(a => a.course_id)
          assignedCoursesCount = courseIds.length
          
          // Get all enrollments in those courses
          const { data: enrollments } = await supabaseAdmin
            .from('enrollments')
            .select('user_id')
            .in('course_id', courseIds)
          
          // Count unique students
          if (enrollments) {
            assignedStudentsCount = new Set(enrollments.map(e => e.user_id)).size
          }
          
          // Get tasks count in assigned courses
          const { count: tasksCount } = await supabaseAdmin
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds)
          assignedTasksCount = tasksCount || 0
          
          // Get projects count in assigned courses
          const { count: projectsCount } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds)
          assignedProjectsCount = projectsCount || 0
        }

        return {
          admin_id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          assigned_courses_count: assignedCoursesCount,
          assigned_students_count: assignedStudentsCount,
          assigned_tasks_count: assignedTasksCount,
          assigned_projects_count: assignedProjectsCount,
          ...totalStats,
        }
      })
    )

    // Sort by projects evaluated and get top 5
    const topAdmins = adminsWithActivity
      .sort((a, b) => b.total_projects_evaluated - a.total_projects_evaluated)
      .slice(0, 5)

    const responseData = {
      overview: {
        total_admins: totalAdmins || 0,
        total_students: totalStudents || 0,
        total_courses: totalCourses || 0,
        total_tasks: totalTasks,
        total_projects: totalProjects,
        total_tickets: totalTickets,
        pending_tickets: pendingTickets,
        pending_projects: pendingProjects
      },
      recent_activity: Object.values(activityByDate),
      top_admins: topAdmins
    }
    
    console.log('📊 Analytics API: Sending response with overview:', responseData.overview)
    console.log('📊 Analytics API: Top admins count:', topAdmins.length)

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error: any) {
    console.error('GET /api/superadmin/analytics error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
