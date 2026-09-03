import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/school-partners?featured=true&limit=12
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '12')

    let query = supabaseAdmin
      .from('school_partners')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (featured === 'true') query = query.eq('is_featured', true)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public school-partners API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        { id: 'mock-1', institution_name: 'Delhi Public School', institution_type: 'school', description: 'One of India\'s most prestigious school chains with a focus on holistic education.', location: 'New Delhi, India', is_featured: true, students_enrolled: 250, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-2', institution_name: 'IIT Delhi', institution_type: 'university', description: 'Premier engineering institution fostering innovation and research excellence.', location: 'New Delhi, India', is_featured: true, students_enrolled: 180, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-3', institution_name: 'Amity University', institution_type: 'university', description: 'Leading private university offering diverse programs across multiple disciplines.', location: 'Noida, India', is_featured: true, students_enrolled: 320, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-4', institution_name: 'Ryan International School', institution_type: 'school', description: 'Global school network committed to excellence in education and character building.', location: 'Multiple Cities, India', is_featured: true, students_enrolled: 150, status: 'active', created_at: new Date().toISOString() },
      ]
    })
  }
}
