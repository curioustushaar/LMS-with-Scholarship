import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
                .eq('user_id', ticketData.user_id)
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
                console.error('❌ Admin cannot access ticket from student outside their courses')
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                )
            }
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

        // Check if ticket exists first
        const { data: ticketData, error: ticketFetchError } = await supabaseAdmin
            .from('tickets')
            .select('user_id')
            .eq('id', ticketId)
            .single()

        if (ticketFetchError || !ticketData) {
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
                .eq('user_id', ticketData.user_id)
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
                console.error('❌ Admin cannot update ticket from student outside their courses')
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                )
            }
        }

        const updateData: any = {}

        if (priority !== undefined) updateData.priority = priority
        if (assigned_to !== undefined) updateData.assigned_to = assigned_to

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, error: 'No fields to update' },
                { status: 400 }
            )
        }

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

/**
 * DELETE /api/admin/tickets/[id]
 * Delete a support ticket and all its messages
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { id: ticketId } = params

        console.log('🗑️ Deleting ticket:', { ticketId })

        // Check if ticket exists first
        const { data: ticketData, error: ticketFetchError } = await supabaseAdmin
            .from('tickets')
            .select('user_id')
            .eq('id', ticketId)
            .single()

        if (ticketFetchError || !ticketData) {
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
                .eq('user_id', ticketData.user_id)
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
                console.error('❌ Admin cannot delete ticket from student outside their courses')
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                )
            }
        }

        // First, delete all related ticket messages
        const { error: messagesError } = await supabaseAdmin
            .from('ticket_messages')
            .delete()
            .eq('ticket_id', ticketId)

        if (messagesError) {
            console.error('❌ Failed to delete ticket messages:', messagesError)
            return NextResponse.json(
                { success: false, error: 'Failed to delete ticket messages', details: messagesError.message },
                { status: 500 }
            )
        }

        // Then delete the ticket itself
        const { error: ticketError } = await supabaseAdmin
            .from('tickets')
            .delete()
            .eq('id', ticketId)

        if (ticketError) {
            console.error('❌ Failed to delete ticket:', ticketError)
            return NextResponse.json(
                { success: false, error: 'Failed to delete ticket', details: ticketError.message },
                { status: 500 }
            )
        }

        console.log('✅ Ticket and messages deleted successfully')

        return NextResponse.json({
            success: true,
            message: 'Ticket deleted successfully'
        })

    } catch (error: any) {
        console.error('💥 Unexpected error in DELETE /tickets/[id]:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
