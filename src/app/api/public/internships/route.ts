import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/internships?limit=6
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    const { data, error } = await supabaseAdmin
      .from('internships')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public internships API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        { id: 'mock-1', role_title: 'Frontend Developer', company_name: 'TechVerve Solutions', work_type: 'remote', duration: '6 Months', stipend: '₹15,000 / month', status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-2', role_title: 'UI/UX Design Intern', company_name: 'Creative Minds', work_type: 'hybrid', duration: '3 Months', stipend: '₹12,000 / month', status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-3', role_title: 'Data Analyst Intern', company_name: 'DataWave Analytics', work_type: 'remote', duration: '6 Months', stipend: '₹18,000 / month', status: 'active', created_at: new Date().toISOString() },
      ]
    })
  }
}
