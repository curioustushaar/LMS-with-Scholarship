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

    console.log('📥 Fetching students with filters:', { status, search })

    // Build query using supabaseAdmin - fetch ALL columns to avoid mismatch errors
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

    console.log(`✅ Found ${data?.length || 0} students`)

    // Map fields for frontend compatibility (profiles uses account_status, frontend expects status)
    const students = (data || []).map(s => ({
      ...s,
      status: s.account_status || 'active',
      enrollment_date: s.created_at
    }))

    return NextResponse.json({ success: true, data: students, count: students.length })

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
