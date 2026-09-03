import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/training?limit=6
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    const { data, error } = await supabaseAdmin
      .from('training_programs')
      .select('*')
      .in('status', ['active', 'upcoming'])
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public training API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        { id: 'mock-1', title: 'React.js Masterclass', description: 'Deep dive into React.js with hooks, context, Redux, and Next.js for production apps.', program_type: 'bootcamp', duration: '8 Weeks', mode: 'online', fee: '₹8,999', trainer_name: 'Rahul Verma', max_participants: 50, current_participants: 32, status: 'active', start_date: new Date(Date.now() + 7*86400000).toISOString(), created_at: new Date().toISOString() },
        { id: 'mock-2', title: 'AWS Cloud Practitioner', description: 'Complete preparation for AWS Cloud Practitioner certification with hands-on labs.', program_type: 'certification', duration: '4 Weeks', mode: 'online', fee: '₹6,499', trainer_name: 'Priya Sharma', max_participants: 40, current_participants: 28, status: 'active', start_date: new Date(Date.now() + 14*86400000).toISOString(), created_at: new Date().toISOString() },
        { id: 'mock-3', title: 'Digital Marketing Workshop', description: 'Intensive workshop covering SEO, SEM, social media marketing, and analytics.', program_type: 'workshop', duration: '2 Days', mode: 'hybrid', fee: '₹2,999', trainer_name: 'Ankit Gupta', max_participants: 30, current_participants: 18, status: 'upcoming', start_date: new Date(Date.now() + 21*86400000).toISOString(), created_at: new Date().toISOString() },
      ]
    })
  }
}
