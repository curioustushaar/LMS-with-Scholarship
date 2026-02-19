import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/students/:id/enrollments
 * Return enrollment list (with course details) for a student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📥 Fetching enrollments for student:', id)

    const { data: enrollments, error: enrollErr } = await supabaseAdmin
      .from('enrollments')
      .select('id, course_id, enrolled_at, created_at')
      .eq('user_id', id)

    if (enrollErr) {
      console.error('❌ Error fetching enrollments for student:', enrollErr.message)
      return NextResponse.json({ success: false, error: enrollErr.message }, { status: 500 })
    }

    console.log(`✅ Found ${enrollments?.length || 0} enrollments for student`)

    const courseIds = (enrollments || []).map((e: any) => e.course_id)

    let courses: any[] = []
    if (courseIds.length) {
      const { data: coursesData, error: coursesErr } = await supabaseAdmin
        .from('courses')
        .select('id, title, status')
        .in('id', courseIds)

      if (coursesErr) {
        console.error('❌ Error fetching courses for enrollments:', coursesErr.message)
      } else {
        courses = coursesData || []
      }
    }

    // map enrollments to include course details
    const mapped = (enrollments || []).map((e: any) => ({
      ...e,
      course: courses.find(c => c.id === e.course_id) || null
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (err: any) {
    console.error('💥 Unexpected error in GET student enrollments:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
