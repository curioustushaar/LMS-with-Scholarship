import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Public endpoint - no auth required for listing domains
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('domain')
      .neq('domain', null)

    if (error) {
      console.error('Failed to fetch domains:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const distinct = Array.from(new Set((data || []).map((d: any) => d.domain))).filter(Boolean)

    return NextResponse.json({ success: true, data: distinct })
  } catch (err: any) {
    console.error('Unexpected error in GET /courses/domains:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
