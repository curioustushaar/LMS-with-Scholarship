import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

// GET /api/school/incentives
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id

    // 1. Fetch assignments, applications, payouts, schemes
    const [assignmentsRes, appsRes, payoutsRes, schemesRes] = await Promise.all([
      supabaseAdmin.from('school_scholarships').select('*').eq('school_id', schoolId),
      supabaseAdmin.from('scholarship_applications').select('id, scholarship_id, payment_status, status, created_at').eq('school_id', schoolId),
      supabaseAdmin.from('school_incentive_payouts').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }),
      supabaseAdmin.from('scholarships').select('id, title, application_fee'),
    ])

    const assignments = assignmentsRes.data || [
      { id: 'ss-001', school_id: schoolId, scholarship_id: 'sch-1', incentive_per_verified_registration: 20, status: 'ACTIVE' }
    ]
    const applications = appsRes.data || []
    const payouts = payoutsRes.data || []
    const schemes = schemesRes.data || []

    let totalEarned = 0
    const schemeBreakdown = assignments.map((assn) => {
      const scheme = schemes.find((s) => s.id === assn.scholarship_id)
      const schApps = applications.filter((a) => a.scholarship_id === assn.scholarship_id)
      const verifiedCount = schApps.filter(
        (a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed'
      ).length
      const rate = Number(assn.incentive_per_verified_registration) || 0
      const earned = verifiedCount * rate
      totalEarned += earned

      return {
        scholarship_id: assn.scholarship_id,
        scholarship_title: scheme?.title || assn.scholarship_id,
        incentive_rate: rate,
        total_registered: schApps.length,
        verified_count: verifiedCount,
        earned,
      }
    })

    const totalPaid = payouts.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const pendingBalance = Math.max(0, totalEarned - totalPaid)

    return NextResponse.json({
      success: true,
      summary: {
        total_verified_registrations: applications.filter(
          (a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed'
        ).length,
        total_earned: totalEarned,
        total_paid: totalPaid,
        pending_balance: pendingBalance,
        bank_details: auth.school.bank_details || {},
      },
      schemes_breakdown: schemeBreakdown,
      payout_history: payouts,
    })
  } catch (error: any) {
    console.error('School incentives GET exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
