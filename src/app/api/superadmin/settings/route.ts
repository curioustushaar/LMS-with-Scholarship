import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/superadmin/settings
 * Get superadmin profile
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('❌ Error fetching profile:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (data?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('💥 Unexpected error GET /superadmin/settings:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * PATCH /api/superadmin/settings
 * Update superadmin profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Verify superadmin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()

    // Validate input data
    const errors: string[] = []
    
    // Validate full_name
    if (body.full_name !== undefined) {
      if (typeof body.full_name !== 'string' || body.full_name.trim().length === 0) {
        errors.push('Full name is required')
      } else if (body.full_name.length > 100) {
        errors.push('Full name must be less than 100 characters')
      }
    }
    
    // Validate email
    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (typeof body.email !== 'string' || !emailRegex.test(body.email)) {
        errors.push('Invalid email address')
      }
    }
    
    // Validate phone
    if (body.phone !== undefined && body.phone !== null && body.phone.trim() !== '') {
      const phone = body.phone.trim()
      
      if (phone.length > 20) {
        errors.push('Phone number must be 20 characters or less')
      }
      
      const phoneRegex = /^[\d\s+\-()]+$/
      if (!phoneRegex.test(phone)) {
        errors.push('Phone number can only contain digits, spaces, +, -, and ()')
      }
      
      const digitsOnly = phone.replace(/[\s+\-()]/g, '')
      if (digitsOnly.length < 10) {
        errors.push('Phone number must contain at least 10 digits')
      }
    }
    
    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: errors.join('. ') 
      }, { status: 400 })
    }

    // Prepare allowed fields with trimmed values
    const allowed: any = {}
    if (body.full_name !== undefined) allowed.full_name = body.full_name.trim()
    if (body.email !== undefined) allowed.email = body.email.trim()
    if (body.profile_image_url !== undefined) allowed.profile_image_url = body.profile_image_url?.trim() || null
    if (body.phone !== undefined) allowed.phone = body.phone?.trim() || null

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(allowed)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('💥 Unexpected error PATCH /superadmin/settings:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}
