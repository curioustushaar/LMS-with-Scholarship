import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

// GET /api/school/results
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const { searchParams } = new URL(request.url)
    const scholarshipId = searchParams.get('scholarship_id')
    const query = searchParams.get('query')?.toLowerCase().trim()

    // 1. Fetch only this school's students and schemes
    const [appsRes, schemesRes] = await Promise.all([
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('school_id', schoolId)
        .order('exam_marks', { ascending: false }),
      supabaseAdmin.from('scholarships').select('*'),
    ])

    const allApps = appsRes.data || []
    const schemes = schemesRes.data || []

    let filteredApps = allApps
    if (scholarshipId && scholarshipId !== 'ALL') {
      filteredApps = filteredApps.filter((a) => a.scholarship_id === scholarshipId)
    }
    if (query) {
      filteredApps = filteredApps.filter(
        (a) =>
          a.applicant_name?.toLowerCase().includes(query) ||
          a.roll_number?.toLowerCase().includes(query) ||
          a.school_roll_number?.toLowerCase().includes(query)
      )
    }

    const appearedStudents = filteredApps.filter((a) => a.exam_marks !== null)
    const absentStudents = filteredApps.filter((a) => a.exam_marks === null)
    const qualifiedStudents = appearedStudents.filter((a) => a.merit_status === 'qualified')
    const notQualifiedStudents = appearedStudents.filter((a) => a.merit_status === 'not_qualified')

    const marksList = appearedStudents.map((a) => Number(a.exam_marks)).filter((m) => !isNaN(m))
    const highestMarks = marksList.length > 0 ? Math.max(...marksList) : 0
    const averageMarks = marksList.length > 0 ? (marksList.reduce((sum, m) => sum + m, 0) / marksList.length).toFixed(1) : 0

    const resultsList = filteredApps.map((app) => {
      const scheme = schemes.find((s) => s.id === app.scholarship_id)
      const isResultDeclared = scheme?.status === 'results_declared' || app.result_status === 'released'

      return {
        id: app.id,
        roll_number: app.roll_number || `GRAVITY-26-${app.application_no.slice(-4)}`,
        applicant_name: app.applicant_name,
        school_roll_number: app.school_roll_number,
        school_class: app.school_class || app.qualification,
        school_section: app.school_section || 'A',
        scholarship_id: app.scholarship_id,
        scholarship_title: app.scholarship_title,
        exam_marks: app.exam_marks,
        total_marks: app.total_marks || 100,
        percentage_score: app.exam_marks !== null ? `${((app.exam_marks / (app.total_marks || 100)) * 100).toFixed(1)}%` : 'N/A',
        rank: app.rank,
        merit_status: app.merit_status || 'waiting',
        result_status: isResultDeclared ? 'PUBLISHED' : 'EVALUATION IN PROGRESS',
        award_status: app.award_status,
        award_amount: app.award_amount,
        award_type: app.award_type,
        photo_url: app.photo_url,
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        total_registered: filteredApps.length,
        total_appeared: appearedStudents.length,
        total_absent: absentStudents.length,
        total_qualified: qualifiedStudents.length,
        total_not_qualified: notQualifiedStudents.length,
        highest_marks: highestMarks,
        average_marks: averageMarks,
      },
      results: resultsList,
      schemes: schemes.map((s) => ({ id: s.id, title: s.title, status: s.status })),
    })
  } catch (error: any) {
    console.error('School results GET exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
