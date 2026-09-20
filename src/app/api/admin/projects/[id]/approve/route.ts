import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/projects/[id]/approve
 * Approve or reject a project
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params
    const body = await request.json()
    const { status, feedback, score } = body

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      )
    }

    // Valid statuses for approval
    const validStatuses = ['approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if project exists
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to this project's user
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const courseIds = assignments?.map(a => a.course_id) || []

      if (courseIds.length > 0) {
        const { data: enrollment } = await supabaseAdmin
          .from('enrollments')
          .select('user_id')
          .eq('user_id', project.user_id)
          .in('course_id', courseIds)
          .limit(1)
          .single()

        if (!enrollment) {
          return NextResponse.json(
            { error: 'Access denied to this project' },
            { status: 403 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'No courses assigned to you' },
          { status: 403 }
        )
      }
    }

    const updateData = {
      status,
      feedback: feedback || null,
      score: score || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: authResult.id
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update project', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Project ${status} successfully`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
