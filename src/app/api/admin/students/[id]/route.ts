import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/students/[id]
 * Get single student details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📥 Fetching student:', { studentId: id })

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Student not found:', { error: error.message, studentId: id })
      return NextResponse.json(
        { success: false, error: 'Student not found', details: error.message },
        { status: 404 }
      )
    }

    if (!data) {
      console.warn('⚠️ No student data:', { studentId: id })
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Also fetch auth metadata to supplement phone, parents_contact, class, school_coaching
    let authMetadata: any = {}
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id)
      authMetadata = authUser?.user?.user_metadata || {}
    } catch (e: any) {
      console.warn('⚠️ Could not fetch auth user metadata for student:', e.message)
    }

    // Map account_status to status for frontend compatibility
    const studentData = {
      ...data,
      phone: data.phone || authMetadata.phone || null,
      parents_contact: data.parents_contact || authMetadata.parents_contact || null,
      class: data.class || authMetadata.class || null,
      school_coaching: data.school_coaching || authMetadata.school_coaching || null,
      status: data.account_status || 'active'
    }

    console.log('✅ Student fetched successfully:', { studentId: id })
    return NextResponse.json({ success: true, data: studentData })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /students/[id]:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/students/[id]
 * Update student details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params
    const body = await request.json()

    console.log('📝 Updating student:', { studentId: id, updates: Object.keys(body) })

    // Allowed fields to update
    const allowedFields = [
      'full_name',
      'email',
      'phone',
      'parents_contact',
      'class',
      'school_coaching',
      'status',
      'profile_image_url'
    ]

    // Filter only allowed fields
    const updateData: any = {}
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update Auth user_metadata to keep in sync
    try {
      const metaUpdates: any = {}
      if (updateData.full_name !== undefined) metaUpdates.full_name = updateData.full_name
      if (updateData.phone !== undefined) metaUpdates.phone = updateData.phone
      if (updateData.parents_contact !== undefined) metaUpdates.parents_contact = updateData.parents_contact
      if (updateData.class !== undefined) metaUpdates.class = updateData.class
      if (updateData.school_coaching !== undefined) metaUpdates.school_coaching = updateData.school_coaching

      if (Object.keys(metaUpdates).length > 0) {
        await supabaseAdmin.auth.admin.updateUserById(id, {
          user_metadata: metaUpdates
        })
      }
    } catch (authUpdateErr: any) {
      console.warn('⚠️ Could not sync metadata in auth.users:', authUpdateErr.message)
    }

    // Map status to account_status for profiles table
    if (updateData.status) {
      updateData.account_status = updateData.status
      delete updateData.status
    }

    // Use supabaseAdmin to bypass RLS
    let data: any = null
    let error: any = null

    const profileRes = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'student')
      .select('*')
      .single()

    data = profileRes.data
    error = profileRes.error

    // Resilient fallback if custom columns do not exist yet in profiles table
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      console.warn('⚠️ Some custom columns may not exist yet in profiles, falling back to base fields:', error.message)
      const baseUpdate: Record<string, any> = {}
      const allowedBase = ['full_name', 'email', 'phone', 'account_status', 'profile_image_url']
      allowedBase.forEach(k => {
        if ((updateData as any)[k] !== undefined) {
          baseUpdate[k] = (updateData as any)[k]
        }
      })
      const fallbackRes = await supabaseAdmin
        .from('profiles')
        .update(baseUpdate)
        .eq('id', id)
        .eq('role', 'student')
        .select('*')
        .single()
      data = fallbackRes.data
      error = fallbackRes.error
    }

    if (error) {
      console.error('❌ Database update error:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      return NextResponse.json(
        { success: false, error: 'Failed to update student', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Student updated successfully:', id)

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        phone: updateData.phone !== undefined ? updateData.phone : data?.phone,
        parents_contact: updateData.parents_contact !== undefined ? updateData.parents_contact : data?.parents_contact,
        class: updateData.class !== undefined ? updateData.class : data?.class,
        school_coaching: updateData.school_coaching !== undefined ? updateData.school_coaching : data?.school_coaching,
      },
      message: 'Student updated successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in PATCH /students/[id]:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
