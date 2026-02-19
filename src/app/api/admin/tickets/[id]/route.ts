import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/tickets/[id]
 * Get a single support ticket by ID with student details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { id: ticketId } = params

        console.log('📥 Fetching ticket:', { ticketId })

        const { data: ticketData, error: ticketError } = await supabaseAdmin
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single()

        if (ticketError) {
            console.error('❌ Database query error:', ticketError)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch ticket', details: ticketError.message },
                { status: 500 }
            )
        }

        if (!ticketData) {
            console.warn('⚠️ Ticket not found:', ticketId)
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            )
        }

        // Get user details from profiles table
        let userData = null
        let assignedUserData = null

        if (ticketData.user_id) {
            const { data: userProfile } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name, email')
                .eq('id', ticketData.user_id)
                .single()
            userData = userProfile
        }

        if (ticketData.assigned_to) {
            const { data: assignedProfile } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name')
                .eq('id', ticketData.assigned_to)
                .single()
            assignedUserData = assignedProfile
        }

        const data = {
            ...ticketData,
            user: userData,
            assigned_to_user: assignedUserData
        }

        console.log('✅ Ticket fetched successfully:', data.id)

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error: any) {
        console.error('💥 Unexpected error in GET /tickets/[id]:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/admin/tickets/[id]
 * Update ticket fields (priority, assigned_to, etc.)
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
        const { priority, assigned_to } = body

        console.log('📝 Updating ticket:', { ticketId, priority, assigned_to })

        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (priority !== undefined) updateData.priority = priority
        if (assigned_to !== undefined) updateData.assigned_to = assigned_to

        const { data, error } = await supabaseAdmin
            .from('tickets')
            .update(updateData)
            .eq('id', ticketId)
            .select()
            .single()

        if (error) {
            console.error('❌ Failed to update ticket:', error)
            return NextResponse.json(
                { success: false, error: 'Failed to update ticket', details: error.message },
                { status: 500 }
            )
        }

        console.log('✅ Ticket updated successfully')

        return NextResponse.json({
            success: true,
            data,
            message: 'Ticket updated successfully'
        })

    } catch (error: any) {
        console.error('💥 Unexpected error in PATCH /tickets/[id]:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
