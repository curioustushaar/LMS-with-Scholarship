import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/tickets/[id]/reply
 * Add a reply/message to a ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: ticketId } = params
    const body = await request.json()
    const { message, attachment_url } = body

    console.log('📝 Adding reply to ticket:', { ticketId })

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if ticket exists
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('id, subject, status, user_id')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error('❌ Ticket not found:', ticketError)
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // For admins, verify the ticket belongs to a student in their assigned courses
    if (authResult.role === 'admin') {
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const courseIds = assignments?.map(a => a.course_id) || []

      if (courseIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No courses assigned' },
          { status: 403 }
        )
      }

      // Check if ticket's user is enrolled in any of admin's courses
      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', ticket.user_id)
        .in('course_id', courseIds)
        .limit(1)
        .maybeSingle()

      if (enrollmentError) {
        console.error('❌ Error checking enrollment:', enrollmentError)
        return NextResponse.json(
          { success: false, error: 'Failed to verify access' },
          { status: 500 }
        )
      }

      if (!enrollment) {
        console.error('❌ Admin cannot reply to ticket from student outside their courses')
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Add message
    const newMessage = {
      ticket_id: ticketId,
      user_id: authResult.id,
      message,
      is_admin: true,
      attachment_url: attachment_url || null
    }

    const { data: insertedMessage, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert(newMessage)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Failed to create message:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send message', details: error.message },
        { status: 500 }
      )
    }

    // Get user details
    let userData = null
    if (insertedMessage.user_id) {
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', insertedMessage.user_id)
        .single()
      userData = userProfile
    }

    const responseData = {
      ...insertedMessage,
      user: userData
    }

    // Update ticket status to in_progress if it's open
    if (ticket.status === 'open') {
      await supabaseAdmin
        .from('tickets')
        .update({
          status: 'in_progress'
        })
        .eq('id', ticketId)
    }

    console.log('✅ Reply added successfully')

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Reply added successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /tickets/[id]/reply:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/tickets/[id]/reply
 * Get all messages for a ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: ticketId } = params

    console.log('📥 Fetching messages for ticket:', { ticketId })

    const { data: messages, error } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch messages:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages', details: error.message },
        { status: 500 }
      )
    }

    // Get user details for each message
    const messagesWithUsers = await Promise.all(
      (messages || []).map(async (msg) => {
        if (!msg.user_id) return { ...msg, user: null }
        
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', msg.user_id)
          .single()
        
        return { ...msg, user: userProfile }
      })
    )

    console.log('✅ Fetched', messagesWithUsers.length, 'messages')

    return NextResponse.json({
      success: true,
      data: messagesWithUsers,
      count: messagesWithUsers.length
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
