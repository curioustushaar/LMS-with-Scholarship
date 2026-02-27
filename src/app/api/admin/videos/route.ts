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

    console.log('📥 Fetching videos:', { weekId, role: authResult.role })

    // For admins, filter by assigned courses
    let allowedWeekIds: string[] = []
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const courseIds = assignments?.map(a => a.course_id) || []
      
      console.log(`📚 Admin has ${courseIds.length} assigned courses`)

      if (courseIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No courses assigned to you yet'
        })
      }

      // Get weeks for these courses
      const { data: weeks } = await supabaseAdmin
        .from('weeks')
        .select('id')
        .in('course_id', courseIds)

      allowedWeekIds = weeks?.map(w => w.id) || []
      
      console.log(`📝 Admin can access ${allowedWeekIds.length} weeks`)

      if (allowedWeekIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0
        })
      }
    }

    // Use supabaseAdmin to bypass RLS
    let query = supabaseAdmin
      .from('videos')
      .select('*')
      .order('order_index', { ascending: true })

    // Filter by admin's allowed weeks
    if (authResult.role === 'admin' && allowedWeekIds.length > 0) {
      query = query.in('week_id', allowedWeekIds)
    }

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
    const { week_id, title, description, video_url, duration_minutes, order_index } = body

    console.log('📝 Creating video:', { week_id, title, video_url: video_url?.substring(0, 50) + '...' })

    if (!week_id || !title || !video_url) {
      console.warn('⚠️ Missing required fields:', { week_id: !!week_id, title: !!title, video_url: !!video_url })
      return NextResponse.json(
        { success: false, error: 'week_id, title, and video_url are required' },
        { status: 400 }
      )
    }

    // If admin (not superadmin), verify week belongs to assigned course
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const courseIds = assignments?.map(a => a.course_id) || []

      if (courseIds.length > 0) {
        const { data: week } = await supabaseAdmin
          .from('weeks')
          .select('course_id')
          .eq('id', week_id)
          .single()

        if (!week || !courseIds.includes(week.course_id)) {
          return NextResponse.json(
            { success: false, error: 'Access denied. You can only add videos to weeks in your assigned courses.' },
            { status: 403 }
          )
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'No courses assigned to you' },
          { status: 403 }
        )
      }
    }

    const videoData = {
      week_id,
      title,
      description: description || null,
      video_url,
      duration_minutes: duration_minutes || null,
      order_index: order_index || 0
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
