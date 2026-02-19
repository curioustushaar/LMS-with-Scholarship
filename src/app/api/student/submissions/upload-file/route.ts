import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/student/submissions/upload-file
 * Upload submission file (PDF, DOC, DOCX, etc.) to Supabase Storage
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('📝 Starting submission file upload:', { 
      fileName: file?.name, 
      fileSize: file?.size,
      fileType: file?.type,
      userId: authResult.id 
    })

    if (!file) {
      console.warn('⚠️ Missing file')
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      )
    }

    // Validate file type - Allow documents and common file types
    const allowedTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]

    if (!allowedTypes.includes(file.type)) {
      console.warn('⚠️ Invalid file type:', file.type)
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, JPG, PNG' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for documents)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      console.warn('⚠️ File too large:', { size: file.size, maxSize })
      return NextResponse.json(
        { success: false, error: 'File size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = `submissions/${authResult.id}/${filename}`

    console.log('📤 Uploading file to storage:', { filepath })

    // Upload to Supabase Storage (using service role to bypass RLS)
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('task-submissions') // Use dedicated bucket for task submissions
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', {
        message: uploadError.message
      })
      return NextResponse.json(
        { success: false, error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('task-submissions')
      .getPublicUrl(filepath)

    const fileUrl = urlData?.publicUrl || ''
    console.log('✅ File uploaded to storage, URL:', fileUrl)

    return NextResponse.json({
      success: true,
      data: {
        file_url: fileUrl,
        filename: file.name,
        filesize: file.size,
        filetype: file.type
      }
    })

  } catch (error: any) {
    console.error('💥 Unexpected error uploading file:', error.message)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
