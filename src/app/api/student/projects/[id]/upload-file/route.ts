import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/student/projects/[id]/upload-file
 * Upload a file deliverable for a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params

    console.log('📝 Starting project file upload:', { 
      projectId
    })

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
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Check if project belongs to this user
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id, title')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('❌ Project not found:', projectError)
      return NextResponse.json(
        { error: 'Project not found', success: false },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      console.error('❌ Access denied: User does not own project')
      return NextResponse.json(
        { error: 'Access denied', success: false },
        { status: 403 }
      )
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', success: false },
        { status: 400 }
      )
    }

    console.log('📁 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filepath = `projects/${user.id}/${projectId}/${timestamp}_${sanitizedFileName}`

    console.log('⬆️ Uploading to storage:', filepath)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('submissions')
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', {
        message: uploadError.message,
        cause: uploadError.cause
      })
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message, success: false },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('submissions')
      .getPublicUrl(filepath)

    const fileUrl = urlData.publicUrl

    console.log('✅ File uploaded to storage, URL:', fileUrl)

    // Save deliverable record to database
    const { data: deliverable, error: dbError } = await supabaseAdmin
      .from('project_deliverables')
      .insert({
        project_id: projectId,
        file_url: fileUrl,
        description: description || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database insert error:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details
      })

      // Try to delete the uploaded file since DB insert failed
      console.warn('⚠️ Database error, rolling back file upload:', { filepath })
      await supabaseAdmin.storage.from('submissions').remove([filepath])

      return NextResponse.json(
        { error: 'Failed to save file record', details: dbError.message, success: false },
        { status: 500 }
      )
    }

    console.log('✅ File deliverable saved to database:', deliverable.id)

    return NextResponse.json({
      success: true,
      data: deliverable,
      message: 'File uploaded successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /student/projects/[id]/upload-file:', {
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
