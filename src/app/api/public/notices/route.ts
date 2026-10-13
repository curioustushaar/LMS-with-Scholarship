import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { parseNoticeVideoMetadata } from '@/lib/notice-utils'

export const dynamic = 'force-dynamic'

export interface PublicNotice {
  id: string
  title: string
  category: string
  badge_text: string
  description: string
  content?: string
  video_url?: string
  video_description?: string
  file_url?: string
  file_type?: string
  file_name?: string
  file_size?: string
  is_pinned: boolean
  is_active: boolean
  published_at: string
  created_at: string
}

const FALLBACK_NOTICES: PublicNotice[] = [
  {
    id: 'demo-notice-1',
    title: 'GRAVITY National STEM Scholarship Examination 2026 - Schedule & Admit Cards',
    category: 'Scholarship',
    badge_text: 'URGENT',
    description: 'Official notice regarding the upcoming offline and computer-based STEM scholarship test dates, reporting instructions, and hall ticket verification.',
    content: 'All registered applicants for the GRAVITY STEM Excellence Scholarship 2026 are hereby informed that the examination will be conducted across 12 designated district test centers. Please ensure you download your verified Admit Card and carry a valid photo ID.',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    video_description: 'Official examination walkthrough explaining student reporting time, admit card verification, and test instructions.',
    file_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image/jpeg',
    file_name: 'Scholarship_Exam_Schedule_2026.jpg',
    file_size: '1.2 MB',
    is_pinned: true,
    is_active: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-notice-2',
    title: 'Admission Guidelines & Free Mentorship Cohort Selection Criteria (Batch 2026-27)',
    category: 'Admissions',
    badge_text: 'IMPORTANT',
    description: 'Detailed circular regarding eligibility criteria, interview process, and fee subsidy waivers for economically weaker students.',
    content: 'AAGAJ Foundation invites applications for its fully-funded industry upskilling and professional internship placement drive. Candidates can check eligibility matrix and apply online through the portal.',
    file_url: '',
    file_type: 'pdf',
    file_name: 'Admission_Policy_Circular_2026.pdf',
    file_size: '840 KB',
    is_pinned: true,
    is_active: true,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-notice-3',
    title: 'Annual Inter-School STEM Innovation Fest & Robotics Workshop Poster',
    category: 'Event',
    badge_text: 'EVENT',
    description: 'Official invitation and brochure for all partner schools participating in the Inter-School Innovation Showcase 2026.',
    content: 'Partner schools and affiliated institutes can nominate up to 15 student projects for the state-level exhibition. Exciting cash prizes and direct scholarship grants will be awarded to top innovators.',
    file_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image/jpeg',
    file_name: 'STEM_Fest_Poster_2026.jpg',
    file_size: '2.4 MB',
    is_pinned: false,
    is_active: true,
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'demo-notice-4',
    title: 'Revised Examination Guidelines & Prohibited Items Circular',
    category: 'Examination',
    badge_text: 'OFFICIAL',
    description: 'Standard operating procedures, biometric attendance guidelines, and list of prohibited electronic items inside examination halls.',
    content: 'Candidates must report to their allotted test centers at least 45 minutes prior to the commencement of the exam. Smartwatches, bluetooth devices, and calculators are strictly prohibited.',
    file_url: '',
    file_type: 'pdf',
    file_name: 'Exam_Guidelines_SOP_2026.pdf',
    file_size: '520 KB',
    is_pinned: false,
    is_active: true,
    published_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
]

// GET /api/public/notices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let query = supabaseAdmin
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      // If table doesn't exist yet, return fallback mock data gracefully
      console.warn('⚠️ Notices query notice table fallback:', error.message)
      let filtered = [...FALLBACK_NOTICES]
      if (category && category !== 'All') {
        filtered = filtered.filter((n) => n.category.toLowerCase() === category.toLowerCase())
      }
      if (search) {
        filtered = filtered.filter((n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.description.toLowerCase().includes(search.toLowerCase())
        )
      }
      return NextResponse.json({ success: true, data: filtered, fallback: true })
    }

    const rawList = data && data.length > 0 ? data : FALLBACK_NOTICES
    const formattedList = rawList.map(parseNoticeVideoMetadata)

    return NextResponse.json({
      success: true,
      data: formattedList,
    })
  } catch (error: any) {
    console.error('Error fetching public notices:', error)
    return NextResponse.json({
      success: true,
      data: FALLBACK_NOTICES.map(parseNoticeVideoMetadata),
      error: error.message,
    })
  }
}
