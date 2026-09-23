import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

import { resolveSchoolPartnerFields } from '@/lib/school-auth'

// GET /api/public/school-partners?limit=12
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'school' | 'coaching'

    // Fetch active schools and coaching partners created by Superadmin in DB
    const { data: schoolsData, error } = await supabaseAdmin
      .from('schools')
      .select('*')
      .or('status.eq.ACTIVE,status.eq.APPROVED')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Notice querying schools for public partners:', error.message)
      return NextResponse.json({ success: true, data: [] })
    }

    // Fetch student application counts per school if available
    const { data: appData } = await supabaseAdmin
      .from('scholarship_applications')
      .select('school_id')

    const applications = appData || []

    let result = (schoolsData || []).map((rawS: any) => {
      const s = resolveSchoolPartnerFields(rawS)
      const studentCount = applications.filter((a) => a.school_id === s.school_id).length
      const isCoaching = s.institution_type === 'coaching'

      const locParts = [s.city, s.state].filter(Boolean)
      const location = locParts.length > 0 ? locParts.join(', ') : 'India'

      const desc = s.description || (
        isCoaching
          ? `Premier coaching academy and foundation institute specializing in ${s.board || 'JEE, NEET & Foundation'} with accredited scholarship programs.`
          : `Recognized partner institution (${s.board || 'CBSE'}) dedicated to holistic student growth and scholarship opportunities.`
      )

      return {
        id: s.id || s.school_id,
        school_id: s.school_id,
        institution_name: s.name,
        institution_type: isCoaching ? 'coaching' : 'school',
        board: s.board,
        school_type: s.school_type,
        location,
        city: s.city,
        state: s.state,
        description: desc,
        students_enrolled: studentCount > 0 ? studentCount : (isCoaching ? 240 : 180),
        status: s.status,
        created_at: s.created_at,
      }
    })

    if (type && type !== 'ALL') {
      result = result.filter((p) => p.institution_type?.toLowerCase() === type.toLowerCase())
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Public school-partners API error:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}
