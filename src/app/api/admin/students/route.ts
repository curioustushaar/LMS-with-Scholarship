import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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

    console.log('📥 Fetching students with filters:', { status, search, role: authResult.role })

    // If admin (not superadmin), get only students from assigned courses
    if (authResult.role === 'admin') {
      // Get admin's assigned course IDs
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const assignedCourseIds = assignments?.map(a => a.course_id) || []
      
      console.log(`📚 Admin has ${assignedCourseIds.length} assigned courses`)

      if (assignedCourseIds.length === 0) {
        console.log('⚠️ No courses assigned to admin')
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No courses assigned to you yet'
        })
      }

      // Get students enrolled in admin's assigned courses
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('user_id')
        .in('course_id', assignedCourseIds)

      const studentIds = Array.from(new Set(enrollments?.map(e => e.user_id) || []))

      console.log(`👥 Found ${studentIds.length} students in assigned courses`)

      if (studentIds.length === 0) {
        console.log('⚠️ No students enrolled in assigned courses')
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No students enrolled in your courses yet'
        })
      }

      // Fetch student profiles
      let query = supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .in('id', studentIds)
        .order('created_at', { ascending: false })

      // Apply filters
      if (status) query = query.eq('account_status', status)
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching students:', error.message)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch students', details: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ Found ${data?.length || 0} students in assigned courses`)

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

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching students:', error.message)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch students', details: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ Found ${data?.length || 0} students (superadmin view)`)

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
