import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/courses/:id/enrollments
 * Return enrollment list (with user details) for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📥 Fetching enrollments for course:', id)

    // Query enrollments table for course enrollments
    // Use LEFT JOIN to handle cases where profile might be missing
    const { data: enrollments, error: enrollmentErr } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        enrolled_at
      `)
      .eq('course_id', id)

    if (enrollmentErr) {
      console.error('❌ Error fetching enrollments:', enrollmentErr.message)
      return NextResponse.json({ success: false, error: enrollmentErr.message }, { status: 500 })
    }

    console.log(`✅ Found ${enrollments?.length || 0} enrollments`)

    // Manually fetch profile data for each enrollment
    const enrichedEnrollments = []
    for (const enrollment of enrollments || []) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role, account_status')
        .eq('id', enrollment.user_id)
        .maybeSingle()

      enrichedEnrollments.push({
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        enrolled_at: enrollment.enrolled_at,
        user: profile ? {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role,
          status: profile.account_status || 'active'
        } : {
          id: enrollment.user_id,
          full_name: 'Unknown User',
          email: 'N/A',
          role: 'student',
          status: 'active'
        }
      })
    }

    console.log(`✅ Enriched ${enrichedEnrollments.length} enrollments with profile data`)

    return NextResponse.json({ success: true, data: enrichedEnrollments })
  } catch (err: any) {
    console.error('💥 Unexpected error in GET enrollments:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
