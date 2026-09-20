import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

// GET /api/school/reports?type=registrations|results|incentives
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'registrations'

    if (reportType === 'registrations') {
      const { data: apps } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })

      const reportData = (apps || []).map((app) => ({
        'Student Name': app.applicant_name,
        'Scholarship Roll No': app.roll_number || app.application_no,
        'School Roll No': app.school_roll_number || '',
        'Class / Grade': app.school_class || app.qualification || '',
        'Section': app.school_section || '',
        'Scholarship Scheme': app.scholarship_title,
        'Registration Date': new Date(app.created_at).toLocaleDateString(),
        'Registration Source': app.registration_source || 'SCHOOL',
        'Payment Status': app.payment_status?.toUpperCase() || 'PAID',
        'Exam Status': app.exam_marks !== null ? 'APPEARED' : 'PENDING',
        'Result': app.merit_status ? app.merit_status.toUpperCase() : 'WAITING',
      }))

      return NextResponse.json({ success: true, type: 'registrations', data: reportData })
    }

    if (reportType === 'results') {
      const { data: apps } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('school_id', schoolId)
        .order('exam_marks', { ascending: false })

      const reportData = (apps || []).map((app) => ({
        'Scholarship Roll No': app.roll_number || app.application_no,
        'Student Name': app.applicant_name,
        'Class': app.school_class || app.qualification || '',
        'Scholarship Scheme': app.scholarship_title,
        'Marks Obtained': app.exam_marks !== null ? app.exam_marks : 'N/A',
        'Total Marks': app.total_marks || 100,
        'Percentage': app.exam_marks !== null ? `${((app.exam_marks / (app.total_marks || 100)) * 100).toFixed(1)}%` : 'N/A',
        'Merit Rank': app.rank || 'N/A',
        'Qualification Status': app.merit_status ? app.merit_status.toUpperCase() : 'WAITING',
        'Award Amount': app.award_amount || 'N/A',
      }))

      return NextResponse.json({ success: true, type: 'results', data: reportData })
    }

    if (reportType === 'incentives') {
      const [assignmentsRes, appsRes, payoutsRes, schemesRes] = await Promise.all([
        supabaseAdmin.from('school_scholarships').select('*').eq('school_id', schoolId),
        supabaseAdmin.from('scholarship_applications').select('*').eq('school_id', schoolId),
        supabaseAdmin.from('school_incentive_payouts').select('*').eq('school_id', schoolId),
        supabaseAdmin.from('scholarships').select('*'),
      ])

      const assignments = assignmentsRes.data || []
      const apps = appsRes.data || []
      const payouts = payoutsRes.data || []
      const schemes = schemesRes.data || []

      const totalPaid = payouts.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

      const reportData = assignments.map((assn) => {
        const scheme = schemes.find((s) => s.id === assn.scholarship_id)
        const schApps = apps.filter((a) => a.scholarship_id === assn.scholarship_id)
        const verified = schApps.filter((a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed').length
        const rate = Number(assn.incentive_per_verified_registration) || 0
        const earned = verified * rate

        return {
          'Scholarship Scheme': scheme?.title || assn.scholarship_id,
          'Total Students Enrolled': schApps.length,
          'Verified Registrations': verified,
          'Incentive Rate (₹)': rate,
          'Total Earned (₹)': earned,
        }
      })

      return NextResponse.json({
        success: true,
        type: 'incentives',
        total_paid: totalPaid,
        data: reportData,
      })
    }

    return schoolErrorResponse('Invalid report type requested.', 400)
  } catch (error: any) {
    console.error('School reports GET exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
