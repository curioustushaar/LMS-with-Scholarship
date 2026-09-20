import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/public/scholarships
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await supabaseAdmin
      .from('scholarships')
      .select('*')
      .in('status', ['published', 'active', 'upcoming', 'results_declared'])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching public scholarships:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public scholarships exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
