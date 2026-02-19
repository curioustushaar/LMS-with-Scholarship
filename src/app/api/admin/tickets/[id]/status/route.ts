import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * PATCH /api/admin/tickets/[id]/status
 * Update ticket status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: ticketId } = params
    const body = await request.json()
    const { status, assigned_to, priority } = body

    console.log('📝 Updating ticket status:', { ticketId, status, priority })

    // Check if ticket exists
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('❌ Ticket not found:', ticketError)
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status
      
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString()
      }
    }

    if (assigned_to !== undefined) {
      updateData.assigned_to = assigned_to
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { success: false, error: `Priority must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.priority = priority
    }

    const { data: updatedTicket, error } = await supabaseAdmin
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Failed to update ticket:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update ticket', details: error.message },
        { status: 500 }
      )
    }

    // Get user details separately
    let userData = null
    let assignedUserData = null

    if (updatedTicket.user_id) {
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', updatedTicket.user_id)
        .single()
      userData = userProfile
    }

    if (updatedTicket.assigned_to) {
      const { data: assignedProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('id', updatedTicket.assigned_to)
        .single()
      assignedUserData = assignedProfile
    }

    const data = {
      ...updatedTicket,
      user: userData,
      assigned_to_user: assignedUserData
    }

    console.log('✅ Ticket updated successfully')

    return NextResponse.json({
      success: true,
      data,
      message: 'Ticket updated successfully'
    })

  } catch (error: any) {
    console.error('💥 Unexpected error in PATCH /tickets/[id]/status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
