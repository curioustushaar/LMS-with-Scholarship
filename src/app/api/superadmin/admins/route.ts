/**
 * Superadmin API - Manage Admins
 * GET - Get all admins with activity summary
 * POST - Create new admin
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
 * GET /api/superadmin/admins
 * Get all admins with their activity summary
 */
export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    // Get all admins (both 'admin' and 'superadmin' role users)
    const { data: adminProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'superadmin'])
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching admin profiles:', profilesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch admins' },
        { status: 500 }
      )
    }

    // Get activity data for each admin
    const adminsWithActivity = await Promise.all(
      (adminProfiles || []).map(async (admin) => {
        // Get total activity stats
        const { data: activities } = await supabaseAdmin
          .from('admin_activities')
          .select('*')
          .eq('admin_id', admin.id)

        const totalStats = activities && activities.length > 0 
          ? activities.reduce(
              (acc, activity) => ({
                total_courses_added: acc.total_courses_added + (activity.courses_added || 0),
                total_students_added: acc.total_students_added + (activity.students_added || 0),
                total_projects_evaluated: acc.total_projects_evaluated + (activity.projects_evaluated || 0),
                total_tasks_created: acc.total_tasks_created + (activity.tasks_created || 0),
                total_tickets_resolved: acc.total_tickets_resolved + (activity.tickets_resolved || 0),
                total_videos_uploaded: acc.total_videos_uploaded + (activity.videos_uploaded || 0),
                total_badges_awarded: acc.total_badges_awarded + (activity.badges_awarded || 0),
                active_days: acc.active_days + 1,
              }),
              {
                total_courses_added: 0,
                total_students_added: 0,
                total_projects_evaluated: 0,
                total_tasks_created: 0,
                total_tickets_resolved: 0,
                total_videos_uploaded: 0,
                total_badges_awarded: 0,
                active_days: 0,
              }
            )
          : {
              total_courses_added: 0,
              total_students_added: 0,
              total_projects_evaluated: 0,
              total_tasks_created: 0,
              total_tickets_resolved: 0,
              total_videos_uploaded: 0,
              total_badges_awarded: 0,
              active_days: 0,
            }

        // Get count of assigned courses from admin_course_assignments table
        const { count: assignedCoursesCount } = await supabaseAdmin
          .from('admin_course_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('admin_id', admin.id)

        // Get assigned students count and other assignment data
        let assignedStudentsCount = 0
        let assignedTasksCount = 0
        let assignedProjectsCount = 0
        
        // Get admin's assigned courses
        const { data: courseAssignments } = await supabaseAdmin
          .from('admin_course_assignments')
          .select('course_id')
          .eq('admin_id', admin.id)
        
        if (courseAssignments && courseAssignments.length > 0) {
          const courseIds = courseAssignments.map(a => a.course_id)
          
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
          role: admin.role,
          account_status: admin.account_status || 'active',
          admin_since: admin.created_at,
          assigned_courses_count: assignedCoursesCount || 0,
          assigned_students_count: assignedStudentsCount,
          assigned_tasks_count: assignedTasksCount,
          assigned_projects_count: assignedProjectsCount,
          ...totalStats,
        }
      })
    )

    // Sort by total projects evaluated
    adminsWithActivity.sort((a, b) => b.total_projects_evaluated - a.total_projects_evaluated)

    return NextResponse.json({
      success: true,
      data: adminsWithActivity,
      count: adminsWithActivity.length
    })
  } catch (error: any) {
    console.error('GET /api/superadmin/admins error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/superadmin/admins
 * Create new admin user
 */
export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const body = await req.json()
    const { email, password, full_name, phone } = body

    // Validation
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Email, password and full name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate phone (if provided)
    if (phone && phone.trim()) {
      const phoneTrimmed = phone.trim()
      
      if (phoneTrimmed.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Phone number must be 20 characters or less' },
          { status: 400 }
        )
      }
      
      const phoneRegex = /^[\d\s+\-()]+$/
      if (!phoneRegex.test(phoneTrimmed)) {
        return NextResponse.json(
          { success: false, error: 'Phone number can only contain digits, spaces, +, -, and ()' },
          { status: 400 }
        )
      }
      
      const digitsOnly = phoneTrimmed.replace(/[\s+\-()]/g, '')
      if (digitsOnly.length < 10) {
        return NextResponse.json(
          { success: false, error: 'Phone number must contain at least 10 digits' },
          { status: 400 }
        )
      }
    }

    // Check if admin already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'admin'
      },
      app_metadata: {
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Error creating admin auth user:', authError)
      return NextResponse.json(
        { success: false, error: authError.message || 'Failed to create admin' },
        { status: 500 }
      )
    }

    console.log('✅ Admin auth user created:', authData.user.id)

    // Wait a bit for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Update or insert profile with admin role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: authData.user.id,
        email: email,
        role: 'admin',
        full_name,
        phone: phone || null,
        account_status: 'active',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      // Try to clean up auth user if profile update fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to setup admin profile: ' + profileError.message },
        { status: 500 }
      )
    }

    console.log('✅ Admin profile created/updated:', profileData)

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role: 'admin',
        account_status: 'active'
      }
    })
  } catch (error: any) {
    console.error('POST /api/superadmin/admins error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
