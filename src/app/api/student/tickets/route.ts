import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/student/tickets
 * Get all tickets for the authenticated student
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📥 Fetching tickets for student:', user.id)

    const { data: tickets, error } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch tickets:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tickets', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Fetched', tickets.length, 'tickets')

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length
    })

  } catch (error: any) {
    console.error('💥 Error in GET /student/tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/tickets
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, description, category, priority } = body

    if (!subject || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Subject, description, and category are required' },
        { status: 400 }
      )
    }

    console.log('📝 Creating ticket for student:', user.id)

    const ticketData = {
      user_id: user.id,
      subject,
      description,
      category,
      priority: priority || 'medium',
      status: 'open'
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .insert(ticketData)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Failed to create ticket:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create ticket', details: error.message },
        { status: 500 }
      )
    }

    // Add initial message
    const messageData = {
      ticket_id: ticket.id,
      user_id: user.id,
      message: description,
      is_admin: false
    }

    await supabaseAdmin
      .from('ticket_messages')
      .insert(messageData)

    console.log('✅ Ticket created successfully:', ticket.id)

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Error in POST /student/tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
