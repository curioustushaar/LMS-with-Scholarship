import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

    let query = supabase
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

    if (!course_id || !week_number || !title) {
      return NextResponse.json(
        { success: false, error: 'course_id, week_number, and title are required' },
        { status: 400 }
      )
    }

    // Check if week number already exists for this course
    const { data: existing } = await supabase
      .from('weeks')
      .select('id')
      .eq('course_id', course_id)
      .eq('week_number', week_number)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Week number already exists for this course' },
        { status: 409 }
      )
    }

    const weekData = {
      course_id,
      week_number,
      title,
      description: description || null,
      // We removed 'locked: true' here to let the database DEFAULT TRUE handle it
      // This helps bypass schema cache errors if the new column isn't recognized yet
    }

    const { data, error } = await supabase
      .from('weeks')
      .insert(weekData)
      .select() // Use default '*' to avoid hard errors on missing column names in cache
      .single()

    if (error) {
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
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
