import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/public/site-content?section=home_hero
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (!section) {
      return NextResponse.json({ success: false, error: 'Section parameter required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('content_key, content_value')
      .eq('section', section)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    // Transform array into key-value object
    const content: Record<string, string> = {}
    data?.forEach((item: any) => {
      content[item.content_key] = item.content_value
    })

    return NextResponse.json(
      { success: true, data: content },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error: any) {
    console.error('Site content API error:', error)
    // Return fallback mock data
    return NextResponse.json({ success: true, data: getFallbackContent(new URL(request.url).searchParams.get('section') || '') })
  }
}

function getFallbackContent(section: string): Record<string, string> {
  const fallbacks: Record<string, Record<string, string>> = {
    home_hero: {
      badge_text: '#1 Intelligent LMS Platform',
      heading_line1: 'Empowering Education.',
      heading_line2: 'Elevating Careers.',
      heading_line3: 'Transforming Futures.',
      description: 'GRAVITY LMS is a complete learning ecosystem that connects Students, Institutions, Employers & Opportunities through intelligent technology and seamless experiences.',
      cta_primary_text: 'Explore Courses',
      cta_primary_link: '/courses',
      cta_secondary_text: 'Apply Admission',
      cta_secondary_link: '/admissions',
      social_proof_text: 'Trusted by 1000+ Students across 25+ Institutions',
    },
    home_stats: {
      stat_1_value: '1000', stat_1_suffix: '+', stat_1_label: 'Active Students',
      stat_2_value: '25', stat_2_suffix: '+', stat_2_label: 'Partner Institutions',
      stat_3_value: '50', stat_3_suffix: '+', stat_3_label: 'Industry Experts',
      stat_4_value: '500', stat_4_suffix: '+', stat_4_label: 'Placements',
      stat_5_value: '95', stat_5_suffix: '%', stat_5_label: 'Satisfaction Rate',
      stat_6_value: '100', stat_6_suffix: '+', stat_6_label: 'Employer Partners',
    },
    about: {
      title: 'About GRAVITY',
      subtitle: 'Empowering the next generation of learners',
      description: 'GRAVITY is a forward-thinking EdTech company dedicated to transforming the educational landscape. We bridge the gap between traditional learning and modern industry requirements through our comprehensive Learning Management System.',
      mission: 'To democratize quality education by providing an accessible, technology-driven learning platform that connects students with world-class courses, mentors, internships, and career opportunities.',
      vision: 'To become India\'s most trusted EdTech ecosystem where every student, regardless of their background, can access premium education, earn industry-recognized certifications, and secure meaningful careers.',
      founded_year: '2024',
    },
  }
  return fallbacks[section] || {}
}
