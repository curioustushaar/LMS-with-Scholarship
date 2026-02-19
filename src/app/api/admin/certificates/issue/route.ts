import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * POST /api/admin/certificates/issue
 * Issue a certificate to a user
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { user_id, course_id, certificate_url } = body

    if (!user_id || !course_id) {
      return NextResponse.json(
        { error: 'user_id and course_id are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Certificate already issued for this course' },
        { status: 409 }
      )
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const certificateData = {
      user_id,
      course_id,
      certificate_number: certificateNumber,
      certificate_url: certificate_url || null,
      issued_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select(`
        *,
        users(id, full_name, email),
        courses(id, title)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to issue certificate', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Certificate issued to ${user.full_name} for ${course.title}`
    }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
