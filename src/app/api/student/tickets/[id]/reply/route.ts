import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/student/tickets/[id]/reply
 * Add a reply to a ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: ticketId } = params
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    console.log('📝 Adding reply to ticket:', ticketId)

    // Verify ticket belongs to this student
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Add message
    const messageData = {
      ticket_id: ticketId,
      user_id: user.id,
      message: message.trim(),
      is_admin: false
    }

    const { data: newMessage, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert(messageData)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Failed to add message:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send message', details: error.message },
        { status: 500 }
      )
    }

    // Get user details
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', user.id)
      .single()

    const responseData = {
      ...newMessage,
      user: userProfile
    }

    console.log('✅ Reply added successfully')

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Reply sent successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Error in POST /student/tickets/[id]/reply:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
