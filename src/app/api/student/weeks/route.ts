import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/student/weeks
 * Get weeks for enrolled courses
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const course_id = searchParams.get('course_id')

    console.log('📥 Fetching weeks for student:', {
      student_id: authResult.id,
      course_id
    })

    if (!course_id) {
       return NextResponse.json(
        { success: false, error: 'course_id is required' },
        { status: 400 }
      )
    }

    // Check enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', authResult.id)
      .eq('course_id', course_id)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { success: false, error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get weeks
    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('*')
      .eq('course_id', course_id)
      .order('week_number', { ascending: true })

    if (weeksError) {
      console.error('❌ Failed to fetch weeks:', weeksError.message)
      throw weeksError
    }

    return NextResponse.json({
      success: true,
      data: weeks
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /student/weeks:', error.message)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}