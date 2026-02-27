import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/certificates/[id]
 * Get certificate details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to this course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabase
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', data.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied to this certificate' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/certificates/[id]
 * Delete/revoke certificate
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    // First, get the certificate to check course access
    const { data: cert } = await supabase
      .from('certificates')
      .select('course_id')
      .eq('id', params.id)
      .single()

    if (!cert) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to this course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabase
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', cert.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied to this certificate' },
          { status: 403 }
        )
      }
    }

    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete certificate', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate revoked successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/certificates/[id]
 * Revoke/update certificate
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()

    // First, get the certificate to check course access
    const { data: cert } = await supabase
      .from('certificates')
      .select('course_id')
      .eq('id', params.id)
      .single()

    if (!cert) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to this course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabase
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', cert.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied to this certificate' },
          { status: 403 }
        )
      }
    }

    const { data, error } = await supabase
      .from('certificates')
      .update({ status: body.status || 'revoked' })
      .eq('id', params.id)
      .select('id, user_id, course_id, certificate_number, issued_at, certificate_url, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update certificate', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Certificate updated successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
