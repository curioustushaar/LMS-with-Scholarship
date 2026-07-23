import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/tasks/[id]/submissions
 * Get all submissions for a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // First check if task exists
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id, title')
      .eq('id', id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Get all submissions for this task
    let query = supabaseAdmin
      .from('task_submissions')
      .select('*')
      .eq('task_id', id)
      .order('submitted_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch submissions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      task: task,
      data,
      count: data?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
