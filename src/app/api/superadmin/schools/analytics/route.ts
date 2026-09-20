import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse } from '@/lib/superadmin-auth'

// GET /api/superadmin/schools/analytics
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const [schoolsRes, schemesRes, assignmentsRes, appsRes, payoutsRes] = await Promise.all([
      supabaseAdmin.from('schools').select('school_id, name, city, state, board, status'),
      supabaseAdmin.from('scholarships').select('id, title, status, application_fee'),
      supabaseAdmin.from('school_scholarships').select('school_id, scholarship_id, incentive_per_verified_registration'),
      supabaseAdmin.from('scholarship_applications').select('id, scholarship_id, school_id, registration_source, payment_status, status, merit_status'),
      supabaseAdmin.from('school_incentive_payouts').select('id, status, amount'),
    ])

    const schools = schoolsRes.data || []
    const schemes = schemesRes.data || []
    const assignments = assignmentsRes.data || []
    const applications = appsRes.data || []
    const payouts = payoutsRes.data || []

    const directApps = applications.filter((a) => a.registration_source !== 'SCHOOL')
    const schoolApps = applications.filter((a) => a.registration_source === 'SCHOOL')

    // 1. Scholarship-wise Deep Analytics
    const scholarshipAnalytics = schemes.map((sch) => {
      const schemeDirect = directApps.filter((a) => a.scholarship_id === sch.id)
      const schemeSchool = schoolApps.filter((a) => a.scholarship_id === sch.id)
      const totalRegistrations = schemeDirect.length + schemeSchool.length
      
      const participatingSchoolsCount = new Set(schemeSchool.map((a) => a.school_id).filter(Boolean)).size
      const fee = Number(sch.application_fee) || 0
      const grossRevenue = totalRegistrations * fee

      // Calculate total incentive payable for this scholarship
      let totalSchemeIncentive = 0
      schemeSchool.forEach((app) => {
        const assn = assignments.find((a) => a.school_id === app.school_id && a.scholarship_id === sch.id)
        const rate = Number(assn?.incentive_per_verified_registration) || 20
        if (app.payment_status === 'paid' || app.payment_status === 'free' || app.status === 'confirmed') {
          totalSchemeIncentive += rate
        }
      })

      const netRevenue = grossRevenue - totalSchemeIncentive

      return {
        id: sch.id,
        title: sch.title,
        status: sch.status,
        application_fee: fee,
        total_registrations: totalRegistrations,
        direct_registrations: schemeDirect.length,
        school_registrations: schemeSchool.length,
        participating_schools: participatingSchoolsCount,
        verified_registrations: applications.filter(
          (a) => a.scholarship_id === sch.id && (a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed')
        ).length,
        gross_revenue: grossRevenue,
        school_incentive_expense: totalSchemeIncentive,
        net_revenue_before_ops: netRevenue,
      }
    })

    // 2. School-wise Performance Ranking
    const schoolRankings = schools.map((s) => {
      const apps = schoolApps.filter((a) => a.school_id === s.school_id)
      const verified = apps.filter((a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed').length
      const qualified = apps.filter((a) => a.merit_status === 'qualified').length

      let totalEarned = 0
      const schAssignments = assignments.filter((a) => a.school_id === s.school_id)
      schAssignments.forEach((assn) => {
        const count = apps.filter((a) => a.scholarship_id === assn.scholarship_id && (a.payment_status === 'paid' || a.payment_status === 'free')).length
        totalEarned += count * (Number(assn.incentive_per_verified_registration) || 0)
      })

      return {
        school_id: s.school_id,
        name: s.name,
        city: s.city,
        state: s.state,
        board: s.board,
        status: s.status,
        enrolled_students: apps.length,
        verified_students: verified,
        qualified_students: qualified,
        incentive_earned: totalEarned,
      }
    }).sort((a, b) => b.enrolled_students - a.enrolled_students)

    return NextResponse.json({
      success: true,
      summary: {
        total_schools: schools.length,
        active_schools: schools.filter((s) => s.status === 'ACTIVE' || s.status === 'APPROVED').length,
        total_registrations: applications.length,
        direct_registrations: directApps.length,
        school_registrations: schoolApps.length,
        school_share_percentage: applications.length > 0 ? ((schoolApps.length / applications.length) * 100).toFixed(1) + '%' : '0%',
        total_incentive_generated: schoolRankings.reduce((sum, s) => sum + s.incentive_earned, 0),
        total_payouts_completed: payouts.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      },
      scholarship_analytics: scholarshipAnalytics,
      top_schools: schoolRankings,
    })
  } catch (error: any) {
    console.error('Superadmin analytics GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
