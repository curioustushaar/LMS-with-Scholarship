import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

/**
 * GET /api/student/tickets/[id]
 * Get a single ticket with messages
 */
export async function GET(
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

    console.log('📥 Fetching ticket:', ticketId, 'for student:', user.id)

    // Get ticket - ensure it belongs to this student
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      console.error('❌ Ticket not found or unauthorized')
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Failed to fetch messages:', messagesError)
    }

    // Get user details for messages
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

    console.log('✅ Ticket and messages fetched successfully')

    return NextResponse.json({
      success: true,
      data: {
        ticket,
        messages: messagesWithUsers
      }
    })

  } catch (error: any) {
    console.error('💥 Error in GET /student/tickets/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
