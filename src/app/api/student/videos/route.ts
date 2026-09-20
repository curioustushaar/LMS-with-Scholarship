import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/student/videos
 * Get videos for enrolled courses
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const week_id = searchParams.get('week_id')

    console.log('📥 Fetching videos for student:', {
      student_id: authResult.id,
      week_id
    })

    if (week_id) {
      // 1. Verify student has access to this week's course
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .select('course_id, lock_status')
        .eq('id', week_id)
        .single()

      if (weekError || !weekData) {
        return NextResponse.json(
          { success: false, error: 'Week not found' },
          { status: 404 }
        )
      }

      // Check enrollment
      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', authResult.id)
        .eq('course_id', weekData.course_id)
        .maybeSingle()

      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Not enrolled in this course' },
          { status: 403 }
        )
      }

      // Fetch videos for the week
      const { data: videos, error: videosError } = await supabaseAdmin
        .from('videos')
        .select('*')
        .eq('week_id', week_id)
        .order('order_index', { ascending: true })

      if (videosError) {
        throw videosError
      }

      return NextResponse.json({
        success: true,
        data: videos
      })
    } 
    
    // If no week_id, we can't efficiently return all videos
    return NextResponse.json(
      { success: false, error: 'week_id parameter is required' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /student/videos:', error.message)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}