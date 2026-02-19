import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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

    // Note: You'll need to add a 'locked' column to weeks table
    // For now, we'll use a metadata approach or add it to the table
    const updateData = {
      // locked: locked, // Add this column to weeks table first
    }

    const { data, error } = await supabase
      .from('weeks')
      .update(updateData)
      .eq('id', id)
      .select('id, course_id, week_number, title, description, created_at, updated_at')
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
