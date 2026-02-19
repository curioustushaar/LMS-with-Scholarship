import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/videos/[id]
 * Get a specific video by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📥 Fetching video:', { id })

    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch video', details: error.message },
        { status: 404 }
      )
    }

    console.log('✅ Video fetched successfully')

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /videos/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/videos/[id]
 * Update a video
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params
    const body = await request.json()
    const { title, description, video_url, duration_minutes, order_index } = body

    console.log('📝 Updating video:', { id, title })

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (video_url !== undefined) updateData.video_url = video_url
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes
    if (order_index !== undefined) updateData.order_index = order_index

    const { data, error } = await supabaseAdmin
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update video', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Video updated successfully')

    return NextResponse.json({
      success: true,
      data,
      message: 'Video updated successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in PUT /videos/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/videos/[id]
 * Delete a video and its associated storage file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('🗑️ Deleting video:', { id })

    // First, get the video to extract storage path
    const { data: video, error: fetchError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !video) {
      console.error('❌ Video not found:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Video not found', details: fetchError?.message },
        { status: 404 }
      )
    }

    console.log('📹 Video found:', { video_url: video.video_url })

    // Check if the video is stored in our Supabase storage (not an external link)
    const videoUrl = video.video_url as string
    const isStoredVideo = videoUrl && videoUrl.includes('/storage/v1/object/public/course-videos/')
    
    if (isStoredVideo) {
      try {
        // Extract the filepath from the URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/course-videos/videos/[week_id]/[filename]
        const urlParts = videoUrl.split('/course-videos/')
        if (urlParts.length > 1) {
          const filepath = urlParts[1]
          console.log('🗄️ Deleting file from storage:', { filepath })

          const { error: storageError } = await supabaseAdmin.storage
            .from('course-videos')
            .remove([filepath])

          if (storageError) {
            console.warn('⚠️ Storage deletion warning:', storageError)
            // Continue with database deletion even if storage deletion fails
          } else {
            console.log('✅ File deleted from storage')
          }
        }
      } catch (storageErr) {
        console.warn('⚠️ Error deleting from storage (continuing):', storageErr)
        // Continue with database deletion even if storage deletion fails
      }
    } else {
      console.log('📎 Video is an external link or link-based, skipping storage deletion')
    }

    // Delete the video record from database
    const { error: deleteError } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Database deletion error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete video from database', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log('✅ Video deleted successfully from database')

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in DELETE /videos/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
