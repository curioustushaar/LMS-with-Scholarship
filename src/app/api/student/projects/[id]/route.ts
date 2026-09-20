import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/student/projects/[id]
 * Submit/Update project by student
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get user from auth header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify user with supabaseAdmin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📝 Student submitting project:', id, {
      userId: user.id,
      status: body.status
    })

    const { project_url, github_url, status, notes } = body

    // Validation
    if (!project_url || !project_url.trim()) {
      return NextResponse.json(
        { error: 'Project URL is required', success: false },
        { status: 400 }
      )
    }

    // Check if project belongs to this user
    const { data: existingProject, error: checkError } = await supabaseAdmin
      .from('projects')
      .select('user_id, description')
      .eq('id', id)
      .single()

    if (checkError || !existingProject) {
      return NextResponse.json(
        { error: 'Project not found', success: false },
        { status: 404 }
      )
    }

    if (existingProject.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied', success: false },
        { status: 403 }
      )
    }

    const updateData: any = {
      project_url: project_url.trim(),
      github_url: github_url?.trim() || null,
      status: status || 'submitted',
      updated_at: new Date().toISOString()
    }

    // If submitting, add submission timestamp
    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString()
    }

    // Add notes to description if provided
    if (notes && notes.trim()) {
      updateData.description = existingProject.description 
        ? `${existingProject.description}\n\nSubmission Notes:\n${notes.trim()}`
        : `Submission Notes:\n${notes.trim()}`
    }

    console.log('🔄 Updating project in database:', {
      id,
      userId: user.id,
      project_url: updateData.project_url,
      github_url: updateData.github_url,
      status: updateData.status
    })

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Double check ownership
      .select('*')
      .single()

    if (error) {
      console.error('❌ Database update error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to update project',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log('✅ Project updated successfully:', {
      id: data.id,
      project_url: data.project_url,
      github_url: data.github_url,
      status: data.status
    })

    return NextResponse.json({
      success: true,
      data,
      message: status === 'submitted' ? 'Project submitted successfully' : 'Project updated successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in PUT /student/projects/[id]:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        success: false
      },
      { status: 500 }
    )
  }
}