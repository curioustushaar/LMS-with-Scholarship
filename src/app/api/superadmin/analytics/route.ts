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

    // Get admin performance (last 7 days) - Calculate from actual tables
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()
    
    console.log('📊 Fetching recent activity from:', sevenDaysAgoISO)

    // Get students added (last 7 days) - grouped by date
    // Using created_at from auth metadata if table column is null
    const { data: studentsAdded, error: studentsQueryError } = await supabaseAdmin
      .from('profiles')
      .select('created_at, id')
      .eq('role', 'student')
      .gte('created_at', sevenDaysAgoISO)
      .order('created_at', { ascending: false })
    
    console.log('📊 Students added in last 7 days (via created_at):', studentsAdded?.length || 0)
    if (studentsQueryError) {
      console.error('❌ Error fetching students:', studentsQueryError.message)
    }
    
    // For students without created_at, get from auth users as fallback
    let authStudentsAdded: any[] = []
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
      if (authData?.users) {
        // Filter students created in last 7 days from auth
        authStudentsAdded = authData.users
          .filter(u => {
            const isStudent = u.user_metadata?.role === 'student' || u.role === 'student'
            const createdAt = new Date(u.created_at)
            const isRecent = createdAt >= sevenDaysAgo
            return isStudent && isRecent
          })
          .map(u => ({
            id: u.id,
            created_at: u.created_at
          }))
        console.log('📊 Students from auth (last 7 days):', authStudentsAdded.length)
      }
    } catch (authError: any) {
      console.error('⚠️ Error fetching auth users:', authError.message)
    }
    
    // Merge students from both sources, removing duplicates
    const allStudents = [...(studentsAdded || []), ...authStudentsAdded]
    const uniqueStudents = Array.from(
      new Map(allStudents.map(s => [s.id, s])).values()
    )
    console.log('📊 Total unique students added in last 7 days:', uniqueStudents.length)

    // Get courses added (last 7 days) - grouped by date
    const { data: coursesAdded } = await supabaseAdmin
      .from('courses')
      .select('created_at')
      .gte('created_at', sevenDaysAgoISO)
      .order('created_at', { ascending: false })
    
    console.log('📊 Courses added in last 7 days:', coursesAdded?.length || 0)

    // Get projects created (last 7 days) - grouped by date
    const { data: projectsCreated } = await supabaseAdmin
      .from('projects')
      .select('created_at')
      .gte('created_at', sevenDaysAgoISO)
      .order('created_at', { ascending: false })
    
    console.log('📊 Projects created in last 7 days:', projectsCreated?.length || 0)

    // Get tasks created (last 7 days) - grouped by date
    const { data: tasksCreated } = await supabaseAdmin
      .from('tasks')
      .select('created_at')
      .gte('created_at', sevenDaysAgoISO)
      .order('created_at', { ascending: false })
    
    console.log('📊 Tasks created in last 7 days:', tasksCreated?.length || 0)

    // Get tickets resolved (last 7 days) - grouped by date
    const { data: ticketsResolved } = await supabaseAdmin
      .from('tickets')
      .select('resolved_at')
      .eq('status', 'resolved')
      .gte('resolved_at', sevenDaysAgoISO)
      .order('resolved_at', { ascending: false })
    
    console.log('📊 Tickets resolved in last 7 days:', ticketsResolved?.length || 0)

    // Group activities by date
    const activityByDate: any = {}
    
    // Helper function to get date string (handles both ISO strings and Date objects)
    const getDateStr = (timestamp: string | Date) => {
      try {
        if (!timestamp) return null
        const dateStr = timestamp instanceof Date 
          ? timestamp.toISOString().split('T')[0]
          : timestamp.split('T')[0]
        return dateStr
      } catch (e) {
        console.error('Error parsing date:', timestamp, e)
        return null
      }
    }
    
    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      activityByDate[dateStr] = {
        date: dateStr,
        courses_added: 0,
        students_added: 0,
        projects_evaluated: 0,
        tasks_created: 0,
        tickets_resolved: 0
      }
    }
    
    console.log('📊 Initialized activity dates:', Object.keys(activityByDate))
    
    // Count students by date (using merged unique students)
    uniqueStudents?.forEach((student) => {
      const dateStr = getDateStr(student.created_at)
      if (dateStr && activityByDate[dateStr]) {
        activityByDate[dateStr].students_added++
      }
    })
    
    console.log('📊 Students grouped by date:', 
      Object.entries(activityByDate).map(([date, data]: [string, any]) => 
        `${date}: ${data.students_added}`
      ).join(', ')
    )
    
    // Count courses by date
    coursesAdded?.forEach((course) => {
      const dateStr = getDateStr(course.created_at)
      if (dateStr && activityByDate[dateStr]) {
        activityByDate[dateStr].courses_added++
      }
    })
    
    // Count projects by date (projects created count as projects evaluated)
    projectsCreated?.forEach((project) => {
      const dateStr = getDateStr(project.created_at)
      if (dateStr && activityByDate[dateStr]) {
        activityByDate[dateStr].projects_evaluated++
      }
    })
    
    // Count tasks by date
    tasksCreated?.forEach((task) => {
      const dateStr = getDateStr(task.created_at)
      if (dateStr && activityByDate[dateStr]) {
        activityByDate[dateStr].tasks_created++
      }
    })
    
    // Count tickets by date
    ticketsResolved?.forEach((ticket) => {
      const dateStr = getDateStr(ticket.resolved_at)
      if (dateStr && activityByDate[dateStr]) {
        activityByDate[dateStr].tickets_resolved++
      }
    })
    
    console.log('📊 Activity by date calculated:', Object.keys(activityByDate).length, 'days')

    // Get top performing admins
    const { data: adminProfiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'superadmin'])
      .order('created_at', { ascending: false })

    // Calculate activity stats for each admin - using actual data
    const adminsWithActivity = await Promise.all(
      (adminProfiles || []).map(async (admin) => {
        // Count students created by this admin (using created_by_admin_id field)
        const { count: studentsCount } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')
          .eq('created_by_admin_id', admin.id)
        
        // Count courses created by this admin (if course has created_by field)
        const { count: coursesCount } = await supabaseAdmin
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', admin.id)
        
        // Count projects in courses assigned to this admin
        const { data: adminCourses } = await supabaseAdmin
          .from('admin_course_assignments')
          .select('course_id')
          .eq('admin_id', admin.id)
        
        const courseIds = adminCourses?.map(ac => ac.course_id) || []
        
        let projectsCount = 0
        let tasksCount = 0
        
        if (courseIds.length > 0) {
          const { count: pCount } = await supabaseAdmin
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds)
          projectsCount = pCount || 0
          
          const { count: tCount } = await supabaseAdmin
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds)
          tasksCount = tCount || 0
        }
        
        // Count tickets resolved by this admin (if tickets has resolved_by or assigned_to)
        const { count: ticketsCount } = await supabaseAdmin
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')
          .eq('assigned_to', admin.id)
        
        // Calculate active days based on creation date
        const createdDate = new Date(admin.created_at)
        const today = new Date()
        const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

        const totalStats = {
          total_courses_added: coursesCount || 0,
          total_students_added: studentsCount || 0,
          total_projects_evaluated: projectsCount,
          total_tasks_created: tasksCount,
          total_tickets_resolved: ticketsCount || 0,
          active_days: daysDiff > 0 ? daysDiff : 1,
        }

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
