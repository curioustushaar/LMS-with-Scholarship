import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, getAllowedCourseIds, getAllowedStudentIds } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/students
 * Get all students with optional filters
 */
export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : null

    console.log('📥 Fetching students with filters:', { status, search, limit, role: authResult.role })

    // If admin or school partner (not superadmin), get students from allowed scope
    if (authResult.role === 'admin' || authResult.role === 'school') {
      const allowedCourseIds = await getAllowedCourseIds(authResult)
      const allowedStudentIds = await getAllowedStudentIds(authResult, allowedCourseIds)

      // Fetch student profiles
      let query = supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      // Filter by allowed students
      if (allowedStudentIds.length > 0) {
        query = query.or(`id.in.(${allowedStudentIds.join(',')}),created_by_admin_id.eq.${authResult.id}`)
      } else if (authResult.role === 'school') {
        // School partner with no students registered yet
        return NextResponse.json({
          success: true,
          data: [],
          count: 0
        })
      } else {
        query = query.eq('created_by_admin_id', authResult.id)
      }

      // Apply filters
      if (status) query = query.eq('account_status', status)
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      if (limit && !isNaN(limit)) query = query.limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching students:', error.message)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch students', details: error.message },
          { status: 500 }
        )
      }

      const students = (data || []).map(s => ({
        ...s,
        status: s.account_status || 'active',
        enrollment_date: s.created_at
      }))

      return NextResponse.json({ success: true, data: students, count: students.length })

    } else {
      // Superadmin sees all students
      let query = supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      // Apply filters
      if (status) query = query.eq('account_status', status)
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      if (limit && !isNaN(limit)) query = query.limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching students:', error.message)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch students', details: error.message },
          { status: 500 }
        )
      }

      const students = (data || []).map(s => ({
        ...s,
        status: s.account_status || 'active',
        enrollment_date: s.created_at
      }))

      return NextResponse.json({ success: true, data: students, count: students.length })
    }

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /students:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
