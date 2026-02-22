import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/courses/:id
 * Get single course with related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('📥 Fetching course:', { courseId: id })

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Database error fetching course:', { 
        code: error.code, 
        message: error.message,
        courseId: id 
      })
      return NextResponse.json(
        { success: false, error: 'Course not found', details: error.message },
        { status: 404 }
      )
    }

    if (!data) {
      console.warn('⚠️ Course not found:', { courseId: id })
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    console.log('✅ Course retrieved:', { courseId: data.id, title: data.title })
    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('💥 Unexpected error fetching course:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/courses/:id
 * Update course
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params
    const body = await request.json()

    console.log('📝 Updating course:', { courseId: id, updates: body })

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error updating course:', { 
        code: error.code, 
        message: error.message,
        courseId: id 
      })
      return NextResponse.json(
        { success: false, error: 'Failed to update course', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Course updated successfully:', data.id)
    return NextResponse.json({
      success: true,
      data,
      message: 'Course updated successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/courses/:id
 * Delete course
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id } = params

    console.log('🗑️ Deleting course:', { courseId: id, admin: authResult.id })

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Failed to delete course:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete course', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Course deleted successfully:', id)
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
