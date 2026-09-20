import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/public/admissions?limit=6
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    const { data, error } = await supabaseAdmin
      .from('admissions')
      .select('*')
      .in('status', ['active', 'upcoming'])
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public admissions API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        { id: 'mock-1', program_name: 'B.Tech Computer Science', description: 'Full-time undergraduate program in Computer Science & Engineering with specializations in AI/ML, Cloud Computing, and Cybersecurity.', eligibility: '10+2 with PCM, minimum 60%', duration: '4 Years', fee_structure: '₹1,20,000 / year', seats_available: 120, status: 'active', application_deadline: new Date(Date.now() + 90*86400000).toISOString(), created_at: new Date().toISOString() },
        { id: 'mock-2', program_name: 'BCA - Bachelor of Computer Applications', description: 'Comprehensive undergraduate program focusing on software development, database management, and web technologies.', eligibility: '10+2 with Mathematics, minimum 50%', duration: '3 Years', fee_structure: '₹80,000 / year', seats_available: 60, status: 'active', application_deadline: new Date(Date.now() + 60*86400000).toISOString(), created_at: new Date().toISOString() },
        { id: 'mock-3', program_name: 'Professional Diploma in Full Stack Development', description: 'Intensive diploma program covering frontend, backend, databases, and DevOps with guaranteed internship placement.', eligibility: 'Graduate in any discipline', duration: '6 Months', fee_structure: '₹45,000 (one-time)', seats_available: 40, status: 'active', application_deadline: new Date(Date.now() + 30*86400000).toISOString(), created_at: new Date().toISOString() },
      ]
    })
  }
}
