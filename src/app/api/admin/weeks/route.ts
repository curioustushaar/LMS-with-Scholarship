import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/weeks
 * Get all weeks with optional filters
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')

    // For admins, filter by assigned courses
    let allowedCourseIds: string[] = []
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      allowedCourseIds = assignments?.map(a => a.course_id) || []

      if (allowedCourseIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No courses assigned to you yet'
        })
      }
    }

    let query = supabaseAdmin
      .from('weeks')
      .select('*')
      .order('week_number', { ascending: true })

    // Filter by admin's allowed courses
    if (authResult.role === 'admin' && allowedCourseIds.length > 0) {
      query = query.in('course_id', allowedCourseIds)
    }

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch weeks', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/weeks
 * Create new week for a course
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { course_id, week_number, title, description } = body

    console.log('Creating week with data:', { course_id, week_number, title, description })

    if (!course_id || !week_number || !title) {
      return NextResponse.json(
        { success: false, error: 'course_id, week_number, and title are required' },
        { status: 400 }
      )
    }

    // If admin (not superadmin), verify access to this course
    if (authResult.role === 'admin') {
      const { data: assignment } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
        .eq('course_id', course_id)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: 'Access denied. You can only create weeks for your assigned courses.' },
          { status: 403 }
        )
      }
    }

    // Check if week number already exists for this course
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('weeks')
      .select('id')
      .eq('course_id', course_id)
      .eq('week_number', week_number)
      .maybeSingle()

    console.log('Existing week check:', { existing, checkError })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Week number already exists for this course' },
        { status: 409 }
      )
    }

    // Create minimal week data - only required fields
    const weekData: any = {
      course_id,
      week_number,
      title,
    }
    
    // Add optional fields only if provided
    if (description) {
      weekData.description = description
    }

    console.log('Inserting week data:', weekData)

    const { data, error } = await supabaseAdmin
      .from('weeks')
      .insert(weekData)
      .select()
      .single()

    console.log('Week insertion result:', { data, error })

    if (error) {
      console.error('Supabase error details:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create week', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Week created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Exception creating week:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
