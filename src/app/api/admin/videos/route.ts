import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/** * GET /api/admin/videos
 * Get all videos with optional filters
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('week_id')

    console.log('📥 Fetching videos:', { weekId })

    // Use supabaseAdmin to bypass RLS
    let query = supabaseAdmin
      .from('videos')
      .select('*')
      .order('order_index', { ascending: true })

    if (weekId) {
      query = query.eq('week_id', weekId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        { success: false, error: 'Failed to fetch videos', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${data?.length || 0} videos`)

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /videos:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/** * POST /api/admin/videos
 * Create new video for a week
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { week_id, title, description, video_url, duration_minutes, order } = body

    console.log('📝 Creating video:', { week_id, title, video_url: video_url?.substring(0, 50) + '...' })

    if (!week_id || !title || !video_url) {
      console.warn('⚠️ Missing required fields:', { week_id: !!week_id, title: !!title, video_url: !!video_url })
      return NextResponse.json(
        { success: false, error: 'week_id, title, and video_url are required' },
        { status: 400 }
      )
    }

    const videoData = {
      week_id,
      title,
      description: description || null,
      video_url,
      duration_minutes: duration_minutes || null,
      order_index: order || 0
    }

    console.log('📤 Inserting video data:', { ...videoData, video_url: videoData.video_url.substring(0, 50) + '...' })

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert(videoData)
      .select() // Use wildcard to avoid schema cache issues with specific column names
      .single()

    if (error) {
      console.error('❌ Database insert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json(
        { success: false, error: 'Failed to create video', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Video created successfully:', data?.id)

    return NextResponse.json({
      success: true,
      data,
      message: 'Video created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /videos:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
