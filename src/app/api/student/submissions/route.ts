import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/student/submissions
 * Get all submissions for the authenticated student
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const task_id = searchParams.get('task_id')
    const status = searchParams.get('status')

    console.log('📥 Fetching submissions for student:', {
      student_id: authResult.id,
      task_id,
      status
    })

    let query = supabaseAdmin
      .from('task_submissions')
      .select(`
        *,
        tasks(id, title, max_points, deadline, courses(title))
      `)
      .eq('user_id', authResult.id)
      .order('submitted_at', { ascending: false })

    if (task_id) {
      query = query.eq('task_id', task_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Failed to fetch submissions:', error.message)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch submissions', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${data?.length || 0} submissions for student`)

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /student/submissions:', error.message)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/submissions
 * Submit a task solution
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { 
      task_id, 
      submission_url, 
      submission_text,
      github_url,
      deploy_url, 
      project_name,
      submission_file_url,
      submission_description
    } = body

    console.log('📝 Creating submission:', {
      student_id: authResult.id,
      task_id,
      project_name,
      github_url,
      deploy_url
    })

    // Validate required fields
    if (!task_id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    if (!submission_url && !submission_text && !github_url && !submission_file_url) {
      return NextResponse.json(
        { success: false, error: 'At least one of submission URL, text, GitHub URL, or file is required' },
        { status: 400 }
      )
    }

    // Check if task exists and student is enrolled in the course
    const { data: taskData, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('id, course_id, domain, deadline, status')
      .eq('id', task_id)
      .single()

    if (taskError || !taskData) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    if (taskData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'This task is not accepting submissions' },
        { status: 400 }
      )
    }

    // Check if student is enrolled in the course
    const { data: enrollmentData, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', authResult.id)
      .eq('course_id', taskData.course_id)
      .single()

    if (enrollmentError || !enrollmentData) {
      return NextResponse.json(
        { success: false, error: 'You are not enrolled in this course' },
        { status: 403 }
      )
    }

    // Check if submission already exists (upsert)
    const { data: existingSubmission } = await supabaseAdmin
      .from('task_submissions')
      .select('id, status')
      .eq('task_id', task_id)
      .eq('user_id', authResult.id)
      .maybeSingle()

    const submissionData = {
      task_id,
      user_id: authResult.id,
      submission_url: submission_url || null,
      submission_text: submission_text || null,
      github_url: github_url || null,
      deploy_url: deploy_url || null,
      project_name: project_name || null,
      submission_file_url: submission_file_url || null,
      submission_description: submission_description || null,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    }

    let result

    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await supabaseAdmin
        .from('task_submissions')
        .update(submissionData)
        .eq('id', existingSubmission.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Create new submission
      const { data, error } = await supabaseAdmin
        .from('task_submissions')
        .insert([submissionData])
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('❌ Failed to submit task:', result.error.message)
      return NextResponse.json(
        { success: false, error: 'Failed to submit task', details: result.error.message },
        { status: 500 }
      )
    }

    console.log('✅ Task submitted successfully:', result.data.id)

    return NextResponse.json({
      success: true,
      data: result.data,
      message: existingSubmission ? 'Submission updated successfully' : 'Task submitted successfully'
    }, { status: existingSubmission ? 200 : 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /student/submissions:', error.message)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
