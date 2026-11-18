import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/school/courses
 * Returns active courses available for school partners to enroll students
 */
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, description, thumbnail_url, duration_weeks, level, status, is_active, price')
      .eq('is_active', true)
      .order('title', { ascending: true })

    if (error) {
      console.warn('⚠️ Fetch school courses query issue:', error.message)
      // Fallback: try without is_active filter in case column differences exist
      const { data: fallbackCourses, error: fallbackError } = await supabaseAdmin
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (fallbackError) {
        return schoolErrorResponse(fallbackError.message, 500)
      }

      return NextResponse.json({
        success: true,
        data: fallbackCourses || [],
        count: fallbackCourses?.length || 0,
      })
    }

    return NextResponse.json({
      success: true,
      data: courses || [],
      count: courses?.length || 0,
    })
  } catch (err: any) {
    console.error('💥 Error in GET /api/school/courses:', err)
    return schoolErrorResponse(err.message || 'Internal server error', 500)
  }
}
