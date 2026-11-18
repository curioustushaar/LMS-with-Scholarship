import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, getAllowedCourseIds } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/certificates
 * Get all certificates with optional filters
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const course_id = searchParams.get('course_id')

    console.log('📜 Fetching certificates with filters:', { status, course_id, role: authResult.role })

    // If admin or school partner (not superadmin), get only certificates from assigned courses
    let allowedCourseIds: string[] = []
    if (authResult.role === 'admin' || authResult.role === 'school') {
      allowedCourseIds = await getAllowedCourseIds(authResult)
      console.log(`📚 User has ${allowedCourseIds.length} assigned courses`)

      if (authResult.role === 'admin' && allowedCourseIds.length === 0) {
        console.log('⚠️ Admin has no assigned courses')
        return NextResponse.json({
          success: true,
          data: [],
          count: 0
        })
      }
    }

    // Use admin client to bypass RLS
    let certQuery = supabaseAdmin
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false })

    // Apply course restriction
    if ((authResult.role === 'admin' || authResult.role === 'school') && allowedCourseIds.length > 0) {
      certQuery = certQuery.in('course_id', allowedCourseIds)
    }

    if (status) {
      certQuery = certQuery.eq('status', status)
    }

    if (course_id) {
      certQuery = certQuery.eq('course_id', course_id)
    }

    const { data: certificates, error: certError } = await certQuery

    if (certError) {
      console.error('❌ Certificate fetch error:', certError)
      return NextResponse.json(
        { error: 'Failed to fetch certificates', details: certError.message },
        { status: 500 }
      )
    }

    console.log(`📜 Found ${certificates?.length || 0} certificates`)

    // Manually join with users and courses using admin client
    const enrichedCertificates = await Promise.all(
      (certificates || []).map(async (cert) => {
        console.log(`📜 Enriching certificate ${cert.certificate_number} - CourseID: ${cert.course_id}`)
        
        // Get user data using admin client
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email')
          .eq('id', cert.user_id)
          .maybeSingle()

        if (userError) {
          console.error(`❌ User fetch error for ${cert.user_id}:`, userError)
        } else if (user) {
          console.log(`✅ User found: ${user?.full_name}`)
        } else {
          console.warn(`⚠️ User not found for ID: ${cert.user_id}`)
        }

        // Get course data using admin client - try both courses and profiles tables
        let course = null
        const { data: courseData, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id, title, description, domain')
          .eq('id', cert.course_id)
          .maybeSingle()

        if (courseError) {
          console.error(`❌ Course fetch error for ${cert.course_id}:`, courseError)
        } else if (courseData) {
          course = courseData
          console.log(`✅ Course found: ${course?.title}`)
        } else {
          console.warn(`⚠️ Course not found for ID: ${cert.course_id}`)
        }

        return {
          ...cert,
          users: user || { id: cert.user_id, full_name: 'User Not Found', email: 'N/A' },
          courses: course || { id: cert.course_id, title: 'Course Not Found', description: null }
        }
      })
    )

    console.log('✅ Successfully enriched all certificates')

    return NextResponse.json({
      success: true,
      data: enrichedCertificates || [],
      count: enrichedCertificates?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
