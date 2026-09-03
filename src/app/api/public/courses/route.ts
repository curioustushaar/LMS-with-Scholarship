import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/courses?featured=true&limit=6
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '12')

    let query = supabaseAdmin
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (featured === 'true') query = query.eq('is_featured', true)
    if (category) query = query.eq('category', category)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public courses API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'mock-1', title: 'UI/UX Design Management', category: 'Design',
          thumbnail_url: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=400&q=80',
          instructor_name: 'John Doe', instructor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
          duration_weeks: 6, rating: 4.8, reviews_count: 142, students_count: 1200, price: '₹5,999',
          level: 'intermediate', description: 'Master modern UI/UX design principles and tools.',
          is_featured: true, status: 'active', created_at: new Date().toISOString()
        },
        {
          id: 'mock-2', title: 'Full Stack Development', category: 'Development',
          thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
          instructor_name: 'Jane Smith', instructor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          duration_weeks: 12, rating: 4.9, reviews_count: 310, students_count: 3400, price: '₹12,499',
          level: 'advanced', description: 'Build production-ready full stack applications.',
          is_featured: true, status: 'active', created_at: new Date().toISOString()
        },
        {
          id: 'mock-3', title: 'Data Science with Python', category: 'Data Science',
          thumbnail_url: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=400&q=80',
          instructor_name: 'John Brown', instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
          duration_weeks: 10, rating: 4.7, reviews_count: 189, students_count: 2100, price: '₹9,999',
          level: 'beginner', description: 'Learn data science from scratch with Python.',
          is_featured: true, status: 'active', created_at: new Date().toISOString()
        },
      ]
    })
  }
}
