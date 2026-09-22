import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/public/school-partners?limit=12
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const type = searchParams.get('type') // 'school' | 'coaching'

    // Fetch active schools and coaching partners created by Superadmin in DB
    let query = supabaseAdmin
      .from('schools')
      .select('*')
      .or('status.eq.ACTIVE,status.eq.APPROVED')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type && type !== 'ALL') {
      query = query.eq('institution_type', type)
    }

    const { data: schoolsData, error } = await query

    if (error) {
      console.warn('Notice querying schools for public partners:', error.message)
      return NextResponse.json({ success: true, data: [] })
    }

    // Fetch student application counts per school if available
    const { data: appData } = await supabaseAdmin
      .from('scholarship_applications')
      .select('school_id')

    const applications = appData || []

    const result = (schoolsData || []).map((s: any) => {
      const studentCount = applications.filter((a) => a.school_id === s.school_id).length
      const isCoaching = (
        s.institution_type === 'coaching' ||
        s.school_id?.startsWith('CCH') ||
        s.school_type?.toLowerCase().includes('coaching') ||
        s.board?.toLowerCase().includes('jee') ||
        s.board?.toLowerCase().includes('neet') ||
        s.name?.toLowerCase().includes('coaching') ||
        s.name?.toLowerCase().includes('institute')
      )

      const locParts = [s.city, s.state].filter(Boolean)
      const location = locParts.length > 0 ? locParts.join(', ') : 'India'

      const desc = s.description || (
        isCoaching
          ? `Premier coaching & test preparation academy providing focused mentorship for ${s.board || 'competitive exams'}.`
          : `Recognized partner school (${s.board || 'CBSE'}) dedicated to quality education and scholarship opportunities.`
      )

      return {
        id: s.id || s.school_id,
        school_id: s.school_id,
        institution_name: s.name,
        institution_type: isCoaching ? 'coaching' : 'school',
        board: s.board,
        school_type: s.school_type,
        location,
        description: desc,
        students_enrolled: studentCount > 0 ? studentCount : 150,
        status: s.status,
        created_at: s.created_at,
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Public school-partners API error:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}
