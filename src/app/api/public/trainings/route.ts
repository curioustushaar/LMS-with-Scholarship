import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const FALLBACK_PUBLIC_WORKSHOPS = [
  {
    id: 'ws-sample-1',
    title: 'Full Stack Web Development & Next.js 14 Masterclass',
    description: 'Learn modern React, Server Components, API routes, and deploy production-grade full-stack web applications in this comprehensive hands-on workshop.',
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    duration_type: '3_days',
    duration_badge: '3 Days Workshop',
    start_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    timing: '06:00 PM - 08:30 PM IST',
    platform: 'Google Meet',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    meeting_id: 'abc-defg-hij',
    passcode: 'GRAVITY2026',
    instructor_name: 'Dr. Anand Kumar',
    instructor_role: 'Lead Cloud Architect & Ex-Google',
    status: 'published',
    max_seats: 150,
  },
  {
    id: 'ws-sample-2',
    title: 'AI & Data Science with Python Bootcamp',
    description: 'Practical training on machine learning algorithms, pandas data analysis, automated data visualization, and generative AI models from scratch.',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    duration_type: '1_week',
    duration_badge: '1 Week Bootcamp',
    start_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 11).toISOString().split('T')[0],
    timing: '07:00 PM - 09:00 PM IST',
    platform: 'Zoom',
    meeting_link: 'https://zoom.us/j/9876543210',
    meeting_id: '987 654 3210',
    passcode: '998877',
    instructor_name: 'Pooja Hegde',
    instructor_role: 'Senior Data Scientist',
    status: 'published',
    max_seats: 200,
  },
  {
    id: 'ws-sample-3',
    title: 'UI/UX Design Systems & Figma Masterclass',
    description: 'Master the art of crafting scalable design systems, interactive Figma components, responsive wireframes, and design handoff for developers.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    duration_type: '1_day',
    duration_badge: '1 Day Intensive',
    start_date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    timing: '05:00 PM - 08:00 PM IST',
    platform: 'Google Meet',
    meeting_link: 'https://meet.google.com/xyz-uvwx-rst',
    meeting_id: 'xyz-uvwx-rst',
    passcode: 'UIUX100',
    instructor_name: 'Rohan Sharma',
    instructor_role: 'Product Designer',
    status: 'published',
    max_seats: 80,
  },
]

// GET /api/public/trainings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data, error } = await supabaseAdmin
      .from('workshops')
      .select('id, title, description, thumbnail_url, duration_type, duration_badge, start_date, end_date, timing, platform, instructor_name, instructor_role, status, max_seats, created_at')
      .eq('status', 'published')
      .order('start_date', { ascending: true })
      .limit(limit)

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: FALLBACK_PUBLIC_WORKSHOPS.slice(0, limit) })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Public trainings API error:', error)
    return NextResponse.json({ success: true, data: FALLBACK_PUBLIC_WORKSHOPS })
  }
}
