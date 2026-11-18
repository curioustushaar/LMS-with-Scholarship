import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/school/workshops
 * Returns upcoming and published workshops/trainings created by Superadmin
 */
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // 'upcoming', 'past', 'all'

    const { data: workshops, error } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.warn('⚠️ Workshops query error:', error.message)
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    const todayStr = new Date().toISOString().split('T')[0]
    let filtered = workshops || []

    if (filter === 'upcoming') {
      filtered = filtered.filter(w => !w.start_date || w.start_date >= todayStr)
    } else if (filter === 'past') {
      filtered = filtered.filter(w => w.start_date && w.start_date < todayStr)
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
      school_name: auth.school.name
    })
  } catch (err: any) {
    console.error('💥 Error in GET /api/school/workshops:', err)
    return schoolErrorResponse(err.message || 'Internal server error', 500)
  }
}
