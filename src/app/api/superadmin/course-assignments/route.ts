import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/superadmin/course-assignments
 * Get all course assignments
 * 
 * POST /api/superadmin/course-assignments
 * Assign courses to an admin
 */

// Verify superadmin
async function verifySuperadmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return { error: 'Invalid or expired token', status: 401 }
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'superadmin') {
      return { error: 'Access denied. Superadmin privileges required.', status: 403 }
    }

    return { user, profile }
  } catch (err: any) {
    return { error: err.message || 'Authentication error', status: 500 }
  }
}

/**
 * GET - Get course assignments for an admin
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

    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get('admin_id')

    let query = supabaseAdmin
      .from('admin_course_assignments')
      .select(`
        *,
        admin:profiles!admin_id(id, email, full_name),
        course:courses!course_id(id, title, description, thumbnail_url)
      `)

    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    const { data, error } = await query.order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching course assignments:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('GET /api/superadmin/course-assignments error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Assign courses to an admin
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
    const { admin_id, course_ids } = body

    if (!admin_id || !Array.isArray(course_ids) || course_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'admin_id and course_ids array required' },
        { status: 400 }
      )
    }

    // Verify admin exists and has admin role
    const { data: admin } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', admin_id)
      .single()

    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      )
    }

    // Create course assignments
    const assignments = course_ids.map(course_id => ({
      admin_id,
      course_id,
      assigned_by: authCheck.user!.id
    }))

    const { data, error } = await supabaseAdmin
      .from('admin_course_assignments')
      .upsert(assignments, { onConflict: 'admin_id,course_id' })
      .select()

    if (error) {
      console.error('Error creating course assignments:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Assigned ${course_ids.length} course(s) to admin`
    })
  } catch (err: any) {
    console.error('POST /api/superadmin/course-assignments error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove course assignment
 */
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const { searchParams } = new URL(req.url)
    const admin_id = searchParams.get('admin_id')
    const course_id = searchParams.get('course_id')

    if (!admin_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'admin_id and course_id required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('admin_course_assignments')
      .delete()
      .eq('admin_id', admin_id)
      .eq('course_id', course_id)

    if (error) {
      console.error('Error deleting course assignment:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Course assignment removed successfully'
    })
  } catch (err: any) {
    console.error('DELETE /api/superadmin/course-assignments error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
