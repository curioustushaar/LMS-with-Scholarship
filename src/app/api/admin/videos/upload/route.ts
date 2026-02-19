import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * POST /api/admin/videos/upload
 * Upload video file to Supabase Storage
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const weekId = formData.get('week_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const durationMinutes = formData.get('duration_minutes') as string

    console.log('📝 Starting video upload:', { fileName: file?.name, fileSize: file?.size, weekId, title })

    if (!file || !weekId || !title) {
      console.warn('⚠️ Missing required fields:', { file: !!file, weekId: !!weekId, title: !!title })
      return NextResponse.json(
        { success: false, error: 'File, week_id, and title are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type)) {
      console.warn('⚠️ Invalid file type:', file.type)
      return NextResponse.json(
        { success: false, error: 'Only video files are allowed (MP4, WebM, MOV, AVI)' },
        { status: 400 }
      )
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      console.warn('⚠️ File too large:', { size: file.size, maxSize })
      return NextResponse.json(
        { success: false, error: 'File size must be less than 500MB' },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = `videos/${weekId}/${filename}`

    console.log('📤 Uploading file to storage:', { filepath })

    // Upload to Supabase Storage (using service role to bypass RLS)
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('course-videos')
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', {
        message: uploadError.message,
        code: uploadError.code
      })
      return NextResponse.json(
        { success: false, error: 'Failed to upload video', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-videos')
      .getPublicUrl(filepath)

    const videoUrl = urlData?.publicUrl || ''
    console.log('✅ File uploaded to storage, URL:', videoUrl.substring(0, 50) + '...')

    // Get next order index for this week (using service role to bypass RLS)
    const { data: videos } = await supabaseAdmin
      .from('videos')
      .select('order_index')
      .eq('week_id', weekId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrder = videos && videos.length > 0 ? (videos[0] as any).order_index + 1 : 0

    // Create video record in database (using service role to bypass RLS)
    console.log('📝 Inserting video record:', {
      week_id: weekId,
      title: title,
      description: description ? description.substring(0, 50) + '...' : null,
      video_url: videoUrl.substring(0, 50) + '...',
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      order_index: nextOrder
    })

    const { data: videoData, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        week_id: weekId,
        title,
        description: description || null,
        video_url: videoUrl,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
        order_index: nextOrder,
      })
      .select('id, week_id, title, description, video_url, duration_minutes, order_index, created_at, updated_at')
      .single()

    if (dbError) {
      // Delete uploaded file if DB insert fails (using service role)
      console.warn('⚠️ Database error, rolling back file upload:', { filepath })
      await supabaseAdmin.storage
        .from('course-videos')
        .remove([filepath])

      console.error('❌ Database insert error:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint
      })

      return NextResponse.json(
        { success: false, error: 'Failed to save video record', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ Video uploaded successfully:', videoData?.id)

    return NextResponse.json({
      success: true,
      data: videoData,
      message: 'Video uploaded successfully',
      url: videoUrl,
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Video upload error:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
