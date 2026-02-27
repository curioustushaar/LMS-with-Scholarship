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
  console.log('\n🚀 ========== STATUS UPDATE API CALLED ==========')
  
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { id: ticketId } = params
    const body = await request.json()
    const { status, assigned_to, priority } = body

    console.log('📝 Request Details:')
    console.log('   - Ticket ID:', ticketId)
    console.log('   - New status:', status)
    console.log('   - Assigned to:', assigned_to)
    console.log('   - Priority:', priority)

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) updateData.status = status
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (priority !== undefined) updateData.priority = priority

    // Set resolved_at when status changes to resolved
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    }

    console.log('🔄 Update data:', updateData)

    // Method 1: Try using helper RPC function (if migration was run)
    if (status || assigned_to || priority) {
      try {
        console.log('🔄 Attempting update via RPC function...')
        
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('update_ticket_status', {
          ticket_id: ticketId,
          new_status: status || null,
          new_priority: priority || null,
          new_assigned_to: assigned_to || null
        })

        if (!rpcError && rpcData) {
          console.log('✅ UPDATE SUCCESSFUL via RPC!')
          console.log('   - Updated data:', rpcData)
          console.log('='.repeat(50) + '\n')

          return NextResponse.json({
            success: true,
            data: rpcData,
            message: 'Ticket updated successfully'
          })
        }

        console.log('⚠️ RPC method failed or not available, trying fallback...')
      } catch (rpcError) {
        console.log('⚠️ RPC error:', rpcError)
      }
    }

    // Method 2: Direct update without select (avoids problematic policies)
    console.log('🔄 Trying direct update method...')
    
    const { error: updateError } = await supabaseAdmin
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)

    if (updateError) {
      console.error('❌ UPDATE FAILED!')
      console.error('   - Error message:', updateError.message)
      console.error('   - Error code:', updateError.code)
      console.error('   - Error details:', updateError.details)
      console.error('   - Error hint:', updateError.hint)
      
      // Provide helpful error message
      let userMessage = 'Database update failed'
      if (updateError.message.includes('tm.created_by')) {
        userMessage = 'Database configuration issue detected. Please run the fix migration script.'
      }
      
      return NextResponse.json(
        {
          success: false,
          error: userMessage,
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint,
          fix: 'Run: node run-ticket-fix-migration.js'
        },
        { status: 500 }
      )
    }

    // Fetch the updated ticket separately
    const { data: updatedTicket, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('id, status, priority, assigned_to, resolved_at, updated_at')
      .eq('id', ticketId)
      .single()

    if (fetchError) {
      console.error('⚠️ Failed to fetch updated ticket:', fetchError)
      // Still return success since update worked
      return NextResponse.json({
        success: true,
        data: { id: ticketId, ...updateData },
        message: 'Ticket updated successfully (fetch failed)'
      })
    }

    console.log('✅ UPDATE SUCCESSFUL!')
    console.log('   - Updated data:', updatedTicket)
    console.log('='.repeat(50) + '\n')

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket updated successfully'
    })

  } catch (error: any) {
    console.error('💥 UNEXPECTED ERROR:')
    console.error('   - Message:', error.message)
    console.error('   - Stack:', error.stack)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
