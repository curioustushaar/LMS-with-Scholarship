import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users
 * Get all users with optional role filter
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    console.log('📥 Fetching users with role:', role || 'all')

    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name', { ascending: true })

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching users:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${data?.length || 0} users`)

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
