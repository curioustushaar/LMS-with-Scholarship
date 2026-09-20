import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/milestones/[id]/update
 * Update project milestone status
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
    const { status, title, description, due_date } = body

    // Check if milestone exists
    const { data: milestone, error: fetchError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'overdue']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (due_date !== undefined) updateData.due_date = due_date

    const { data, error } = await supabase
      .from('project_milestones')
      .update(updateData)
      .eq('id', id)
      .select('*, projects(id, title, user_id)')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update milestone', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Milestone updated successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
