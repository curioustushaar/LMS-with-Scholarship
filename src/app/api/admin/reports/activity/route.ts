import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/reports/activity
 * Get recent system activity feed
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const days = parseInt(searchParams.get('days') || '7')

    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - days)

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

      if (allowedStudentIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          period: `Last ${days} days`
        })
      }
    }

    // Get recent activities from different tables
    const [
      newStudents,
      taskSubmissions,
      projectSubmissions,
      newTickets,
      issuedCertificates
    ] = await Promise.all([
      // New students - filter by allowed students for admins
      authResult.role === 'admin'
        ? supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, created_at')
            .eq('role', 'student')
            .in('id', allowedStudentIds)
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false })
            .limit(limit)
        : supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, created_at')
            .eq('role', 'student')
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false })
            .limit(limit),

      // Task submissions - filter by allowed students for admins
      authResult.role === 'admin'
        ? supabaseAdmin
            .from('task_submissions')
            .select('*, profiles!user_id(full_name), tasks(title)')
            .in('user_id', allowedStudentIds)
            .gte('submitted_at', dateLimit.toISOString())
            .order('submitted_at', { ascending: false })
            .limit(limit)
        : supabaseAdmin
            .from('task_submissions')
            .select('*, profiles!user_id(full_name), tasks(title)')
            .gte('submitted_at', dateLimit.toISOString())
            .order('submitted_at', { ascending: false })
            .limit(limit),

      // Project submissions - filter by allowed students for admins
      authResult.role === 'admin'
        ? supabaseAdmin
            .from('projects')
            .select('*, profiles!user_id(full_name)')
            .in('user_id', allowedStudentIds)
            .gte('submitted_at', dateLimit.toISOString())
            .order('submitted_at', { ascending: false })
            .limit(limit)
        : supabaseAdmin
            .from('projects')
            .select('*, profiles!user_id(full_name)')
            .gte('submitted_at', dateLimit.toISOString())
            .order('submitted_at', { ascending: false })
            .limit(limit),

      // Tickets - filter by allowed students for admins
      authResult.role === 'admin'
        ? supabaseAdmin
            .from('tickets')
            .select('*, profiles!user_id(full_name)')
            .in('user_id', allowedStudentIds)
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false })
            .limit(limit)
        : supabaseAdmin
            .from('tickets')
            .select('*, profiles!user_id(full_name)')
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: false })
            .limit(limit),

      // Certificates - filter by allowed students for admins
      authResult.role === 'admin'
        ? supabaseAdmin
            .from('certificates')
            .select('*, profiles!user_id(full_name), courses(title)')
            .in('user_id', allowedStudentIds)
            .gte('issued_at', dateLimit.toISOString())
            .order('issued_at', { ascending: false })
            .limit(limit)
        : supabaseAdmin
            .from('certificates')
            .select('*, profiles!user_id(full_name), courses(title)')
            .gte('issued_at', dateLimit.toISOString())
            .order('issued_at', { ascending: false })
            .limit(limit)
    ])

    // Format activities
    const activities: any[] = []

    // Add new students
    newStudents.data?.forEach(student => {
      activities.push({
        type: 'new_student',
        timestamp: student.created_at,
        description: `New student joined: ${student.full_name}`,
        data: student
      })
    })

    // Add task submissions
    taskSubmissions.data?.forEach(submission => {
      activities.push({
        type: 'task_submission',
        timestamp: submission.submitted_at,
        description: `${submission.profiles?.full_name} submitted task: ${submission.tasks?.title}`,
        data: submission
      })
    })

    // Add project submissions
    projectSubmissions.data?.forEach(project => {
      activities.push({
        type: 'project_submission',
        timestamp: project.submitted_at,
        description: `${project.profiles?.full_name} submitted project: ${project.title}`,
        data: project
      })
    })

    // Add new tickets
    newTickets.data?.forEach(ticket => {
      activities.push({
        type: 'new_ticket',
        timestamp: ticket.created_at,
        description: `${ticket.profiles?.full_name} created support ticket: ${ticket.subject}`,
        data: ticket
      })
    })

    // Add certificates
    issuedCertificates.data?.forEach(cert => {
      activities.push({
        type: 'certificate_issued',
        timestamp: cert.issued_at,
        description: `Certificate issued to ${cert.profiles?.full_name} for ${cert.courses?.title}`,
        data: cert
      })
    })

    // Sort all activities by timestamp
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedActivities,
      count: limitedActivities.length,
      period: `Last ${days} days`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
