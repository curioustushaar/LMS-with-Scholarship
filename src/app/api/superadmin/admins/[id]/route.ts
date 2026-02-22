/**
 * Superadmin API - Individual Admin Management
 * GET - Get specific admin with detailed activity
 * PATCH - Update admin details
 * DELETE - Delete admin
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
 * GET /api/superadmin/admins/[id]
 * Get specific admin with detailed activity
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const adminId = params.id

    // Get admin profile
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminId)
      .eq('role', 'admin')
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Get activity summary
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('admin_activity_summary')
      .select('*')
      .eq('admin_id', adminId)
      .single()

    // Get recent daily activities (last 30 days)
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from('admin_activities')
      .select('*')
      .eq('admin_id', adminId)
      .order('activity_date', { ascending: false })
      .limit(30)

    return NextResponse.json({
      success: true,
      data: {
        profile: admin,
        summary: summary || {
          admin_id: adminId,
          total_courses_added: 0,
          total_students_added: 0,
          total_projects_evaluated: 0,
          total_tasks_created: 0,
          total_tickets_resolved: 0,
          total_videos_uploaded: 0,
          total_badges_awarded: 0,
          active_days: 0
        },
        recent_activities: activities || []
      }
    })
  } catch (error: any) {
    console.error('GET /api/superadmin/admins/[id] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/superadmin/admins/[id]
 * Update admin details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const adminId = params.id
    const body = await req.json()
    const { full_name, phone, account_status } = body

    // Validate admin exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', adminId)
      .eq('role', 'admin')
      .single()

    if (checkError || !existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Update admin profile
    const updateData: any = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined) updateData.phone = phone
    if (account_status !== undefined) updateData.account_status = account_status

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', adminId)
      .select()
      .single()

    if (error) {
      console.error('Error updating admin:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update admin' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      data
    })
  } catch (error: any) {
    console.error('PATCH /api/superadmin/admins/[id] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/superadmin/admins/[id]
 * Delete admin (soft delete - set status to inactive)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const adminId = params.id

    // Validate admin exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', adminId)
      .eq('role', 'admin')
      .single()

    if (checkError || !existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Soft delete - set account status to inactive
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ account_status: 'inactive' })
      .eq('id', adminId)

    if (updateError) {
      console.error('Error deleting admin:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete admin' },
        { status: 500 }
      )
    }

    // Optionally delete from Supabase Auth
    // await supabaseAdmin.auth.admin.deleteUser(adminId)

    return NextResponse.json({
      success: true,
      message: 'Admin deactivated successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/superadmin/admins/[id] error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
