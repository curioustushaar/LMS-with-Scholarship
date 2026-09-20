import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/weeks/[id]/lock
 * Lock or unlock a week
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
    const { locked } = body

    if (typeof locked !== 'boolean') {
      return NextResponse.json(
        { error: 'locked field must be a boolean' },
        { status: 400 }
      )
    }

    // First, get the week to check course access
    const { data: week } = await supabaseAdmin
      .from('weeks')
      .select('course_id')
      .eq('id', id)
      .single()

    if (!week) {
      return NextResponse.json(
        { error: 'Week not found' },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to week's course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', week.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'Access denied to this week' },
          { status: 403 }
        )
      }
    }

    const updateData = {
      locked: locked,
    }

    const { data, error } = await supabaseAdmin
      .from('weeks')
      .update(updateData)
      .eq('id', id)
      .select('id, course_id, week_number, title, description, locked, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update week', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Week ${locked ? 'locked' : 'unlocked'} successfully`
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
