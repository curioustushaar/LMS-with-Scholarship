import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, getAllowedCourseIds, getAllowedStudentIds } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/tickets
 * Get all support tickets with filters
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assigned_to = searchParams.get('assigned_to')

    console.log('📥 Fetching tickets with filters:', { status, priority, assigned_to, role: authResult.role })

    // For admins and school partners, filter by allowed students
    let allowedStudentIds: string[] = []
    if (authResult.role === 'admin' || authResult.role === 'school') {
      const courseIds = await getAllowedCourseIds(authResult)
      allowedStudentIds = await getAllowedStudentIds(authResult, courseIds)

      console.log(`👥 User can see tickets from ${allowedStudentIds.length} students`)

      if (authResult.role === 'admin' && courseIds.length > 0 && allowedStudentIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0
        })
      }
    }

    let query = supabaseAdmin
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by allowed students
    if ((authResult.role === 'admin' || authResult.role === 'school') && allowedStudentIds.length > 0) {
      query = query.in('user_id', allowedStudentIds)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error('❌ Failed to fetch tickets:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tickets', details: error.message },
        { status: 500 }
      )
    }

    // Get user details for each ticket
    const ticketsWithUsers = await Promise.all(
      (tickets || []).map(async (ticket) => {
        if (!ticket.user_id) return { ...ticket, user: null }
        
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', ticket.user_id)
          .single()
        
        return { ...ticket, user: userProfile }
      })
    )

    console.log('✅ Fetched', ticketsWithUsers.length, 'tickets')

    return NextResponse.json({
      success: true,
      data: ticketsWithUsers,
      count: ticketsWithUsers.length
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in GET /tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
