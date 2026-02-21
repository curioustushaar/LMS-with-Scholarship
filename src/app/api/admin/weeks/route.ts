import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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

    let query = supabaseAdmin
      .from('weeks')
      .select('*')
      .order('week_number', { ascending: true })

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
