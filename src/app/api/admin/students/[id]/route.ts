import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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

    // Map account_status to status for frontend compatibility
    const studentData = {
      ...data,
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

    // Map status to account_status for profiles table
    if (updateData.status) {
      updateData.account_status = updateData.status
      delete updateData.status
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'student')
      .select('*')
      .single()

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
      data,
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
