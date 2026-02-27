import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * PATCH /api/admin/tickets/[id]/status
 * Update ticket status - SIMPLIFIED VERSION FOR TESTING
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
    console.log('   - Body:', JSON.stringify(body))

    // BYPASS SUPABASE CLIENT - Use direct REST API call
    if (status) {
      console.log('🔧 Attempting direct REST API call:', status)
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      
      const response = await fetch(`${supabaseUrl}/rest/v1/tickets?id=eq.${ticketId}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status })
      })

      console.log('📊 Direct REST API Result:')
      console.log('   - Status:', response.status)
      console.log('   - Status Text:', response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('   - Error:', errorText)
        
        return NextResponse.json(
          {
            success: false,
            error: 'Database update failed',
            details: errorText
          },
          { status: 500 }
        )
      }
      
      const error = null

      if (error) {
        console.error('❌ UPDATE FAILED!')
        console.error('   - Error message:', error.message)
        console.error('   - Error code:', error.code)
        console.error('   - Error details:', error.details)
        console.error('   - Error hint:', error.hint)
        
        return NextResponse.json(
          {
            success: false,
            error: 'Database update failed',
            details: error.message,
            code: error.code,
            hint: error.hint
          },
          { status: 500 }
        )
      }

      console.log('✅ UPDATE SUCCESSFUL!')
      console.log('='.repeat(50) + '\n')

      return NextResponse.json({
        success: true,
        message: 'Status updated successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'No status provided' },
      { status: 400 }
    )

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
