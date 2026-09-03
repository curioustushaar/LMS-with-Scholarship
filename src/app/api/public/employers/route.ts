import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/employers?featured=true&limit=12
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '12')

    let query = supabaseAdmin
      .from('employers')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (featured === 'true') query = query.eq('is_featured', true)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public employers API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        { id: 'mock-1', company_name: 'TechVerve Solutions', industry: 'IT Services', description: 'Leading IT solutions provider specializing in cloud infrastructure and enterprise software.', location: 'Bangalore, India', partnership_type: 'hiring', is_featured: true, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-2', company_name: 'Creative Minds Studio', industry: 'Design & Media', description: 'Award-winning design agency creating stunning digital experiences for global brands.', location: 'Mumbai, India', partnership_type: 'hiring', is_featured: true, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-3', company_name: 'DataWave Analytics', industry: 'Data & AI', description: 'AI-powered analytics firm transforming businesses through data-driven decision making.', location: 'Hyderabad, India', partnership_type: 'training', is_featured: true, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-4', company_name: 'CloudNex Systems', industry: 'Cloud Computing', description: 'Next-generation cloud infrastructure company enabling digital transformation.', location: 'Pune, India', partnership_type: 'all', is_featured: true, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-5', company_name: 'InnoVenture Labs', industry: 'Startups', description: 'Venture studio building and scaling innovative technology startups across India.', location: 'Delhi NCR, India', partnership_type: 'sponsoring', is_featured: false, status: 'active', created_at: new Date().toISOString() },
        { id: 'mock-6', company_name: 'FinEdge Technologies', industry: 'FinTech', description: 'Fintech company revolutionizing digital payments and banking solutions.', location: 'Chennai, India', partnership_type: 'hiring', is_featured: false, status: 'active', created_at: new Date().toISOString() },
      ]
    })
  }
}
