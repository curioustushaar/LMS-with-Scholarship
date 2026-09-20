import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/student/courses
 * Get enrolled courses for the logged-in student
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const userId = authResult.id

    console.log('📥 Fetching enrolled courses for student:', userId)

    // Fetch enrollments with course details using supabaseAdmin to bypass RLS
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        enrolled_at,
        created_at,
        courses:course_id (
          id,
          title,
          description,
          domain,
          level,
          duration_weeks,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    if (enrollError) {
      console.error('❌ Error fetching enrollments:', enrollError)
      return NextResponse.json(
        { error: 'Failed to fetch enrolled courses', details: enrollError.message, success: false },
        { status: 500 }
      )
    }

    // Transform the data to flatten courses
    const coursesData = enrollments
      ?.filter(e => e.courses) // Filter out enrollments with null courses
      .map(e => ({
        enrollment_id: e.id,
        enrolled_at: e.enrolled_at || e.created_at,
        ...e.courses
      })) || []

    console.log(`✅ Found ${coursesData.length} enrolled courses for student ${userId}`)

    return NextResponse.json({
      success: true,
      data: coursesData,
      count: coursesData.length
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /api/student/courses:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
