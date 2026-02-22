import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Verify if user is superadmin
async function verifySuperadmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return { error: 'Invalid token', status: 401 }
  }

  // Check if user is superadmin
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'superadmin') {
    return { error: 'Access denied. Superadmin only.', status: 403 }
  }

  return { user, profile }
}

/**
 * PATCH /api/superadmin/admins/[id]/status
 * Toggle admin status (enable/disable)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify superadmin access
    const authCheck = await verifySuperadmin(req)
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      )
    }

    const { id } = params
    const body = await req.json()
    const { account_status } = body

    if (!account_status || !['active', 'suspended'].includes(account_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account status. Use "active" or "suspended"' },
        { status: 400 }
      )
    }

    // Update admin status
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ account_status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('role', 'admin') // Only allow updating admin accounts, not superadmin
      .select()
      .single()

    if (error) {
      console.error('Error updating admin status:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Admin not found or cannot modify superadmin' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Admin ${account_status === 'active' ? 'enabled' : 'disabled'} successfully`
    })
  } catch (err: any) {
    console.error('Error in PATCH /api/superadmin/admins/[id]/status:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
