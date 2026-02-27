import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * DELETE /api/admin/weeks/[id]
 * Delete a week and all its associated videos
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('🗑️ Deleting week:', { id })

    // First, get the week to check course access
    const { data: week } = await supabaseAdmin
      .from('weeks')
      .select('course_id')
      .eq('id', id)
      .single()

    if (!week) {
      return NextResponse.json(
        { success: false, error: 'Week not found' },
        { status: 404 }
      )
    }

    // If admin (not superadmin), verify access to week's course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', week.course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: 'Access denied. You can only delete weeks from your assigned courses.' },
          { status: 403 }
        )
      }
    }

    // Get all videos associated with this week
    const { data: videos, error: videosError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('week_id', id)

    if (videosError) {
      console.error('❌ Error fetching videos:', videosError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch week videos', details: videosError.message },
        { status: 500 }
      )
    }

    console.log(`📹 Found ${videos?.length || 0} videos to delete`)

    // Delete all associated videos (this will also delete their storage files)
    if (videos && videos.length > 0) {
      for (const video of videos) {
        // Check if the video is stored in our Supabase storage
        const videoUrl = video.video_url as string
        const isStoredVideo = videoUrl && videoUrl.includes('/storage/v1/object/public/course-videos/')
        
        if (isStoredVideo) {
          try {
            // Extract the filepath from the URL
            const urlParts = videoUrl.split('/course-videos/')
            if (urlParts.length > 1) {
              const filepath = urlParts[1]
              console.log('🗄️ Deleting video file from storage:', { filepath })

              const { error: storageError } = await supabaseAdmin.storage
                .from('course-videos')
                .remove([filepath])

              if (storageError) {
                console.warn('⚠️ Storage deletion warning:', storageError)
              } else {
                console.log('✅ Video file deleted from storage')
              }
            }
          } catch (storageErr) {
            console.warn('⚠️ Error deleting video from storage (continuing):', storageErr)
          }
        }
      }

      // Delete all video records from database
      const { error: deleteVideosError } = await supabaseAdmin
        .from('videos')
        .delete()
        .eq('week_id', id)

      if (deleteVideosError) {
        console.error('❌ Error deleting videos from database:', deleteVideosError)
        return NextResponse.json(
          { success: false, error: 'Failed to delete week videos', details: deleteVideosError.message },
          { status: 500 }
        )
      }

      console.log('✅ All videos deleted successfully')
    }

    // Delete the week record from database
    const { error: deleteWeekError } = await supabaseAdmin
      .from('weeks')
      .delete()
      .eq('id', id)

    if (deleteWeekError) {
      console.error('❌ Error deleting week from database:', deleteWeekError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete week', details: deleteWeekError.message },
        { status: 500 }
      )
    }

    console.log('✅ Week deleted successfully from database')

    return NextResponse.json({
      success: true,
      message: 'Week and all associated videos deleted successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in DELETE /weeks/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
