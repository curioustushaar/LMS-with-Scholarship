import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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

    console.log('📜 Fetching certificates with filters:', { status, course_id })

    // Use admin client to bypass RLS
    let certQuery = supabaseAdmin
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false })

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
        console.log(`📜 Enriching certificate ${cert.certificate_number}...`)
        
        // Get user data using admin client
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email')
          .eq('id', cert.user_id)
          .single()

        if (userError) {
          console.error(`❌ User fetch error for ${cert.user_id}:`, userError)
        } else {
          console.log(`✅ User found: ${user?.full_name}`)
        }

        // Get course data using admin client
        const { data: course, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id, title, description')
          .eq('id', cert.course_id)
          .single()

        if (courseError) {
          console.error(`❌ Course fetch error for ${cert.course_id}:`, courseError)
        } else {
          console.log(`✅ Course found: ${course?.title}`)
        }

        return {
          ...cert,
          users: user || null,
          courses: course || null
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
