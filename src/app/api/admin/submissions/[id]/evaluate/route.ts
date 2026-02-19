import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { checkAndAwardTaskBadges } from '@/lib/badges'

/**
 * PATCH /api/admin/submissions/[id]/evaluate
 * Evaluate/grade a submission
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
    const { status, points_awarded, feedback } = body

    if (!status || points_awarded === undefined) {
      return NextResponse.json(
        { error: 'status and points_awarded are required' },
        { status: 400 }
      )
    }

    // Valid statuses for evaluation
    const validStatuses = ['reviewed', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if submission exists
    const { data: submission, error: fetchError } = await supabase
      .from('task_submissions')
      .select('*, tasks(max_points)')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Validate points
    const maxPoints = submission.tasks?.max_points || 100
    if (points_awarded < 0 || points_awarded > maxPoints) {
      return NextResponse.json(
        { error: `Points must be between 0 and ${maxPoints}` },
        { status: 400 }
      )
    }

    const updateData = {
      status,
      points_awarded,
      feedback: feedback || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: authResult.id
    }

    const { data, error } = await supabase
      .from('task_submissions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users!task_submissions_user_id_fkey(id, full_name, email),
        tasks(title, max_points)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to evaluate submission', details: error.message },
        { status: 500 }
      )
    }

    // 🏅 Auto-award badges if task is approved
    let badgeResult = null
    if (status === 'approved' && data) {
      console.log('🏅 Task approved! Checking for badge awards...')
      badgeResult = await checkAndAwardTaskBadges(submission.user_id, submission.task_id)
      
      if (badgeResult.success && badgeResult.badges_awarded > 0) {
        console.log(`✅ Awarded ${badgeResult.badges_awarded} badge(s) to student`)
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Submission evaluated successfully',
      badges_awarded: badgeResult?.badges_awarded || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
