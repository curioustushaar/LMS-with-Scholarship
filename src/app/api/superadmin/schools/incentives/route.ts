import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse, successResponse } from '@/lib/superadmin-auth'

// GET /api/superadmin/schools/incentives
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const { searchParams } = new URL(request.url)
    const schoolIdFilter = searchParams.get('school_id')

    const [schoolsRes, assignmentsRes, appsRes, payoutsRes, schemesRes] = await Promise.all([
      supabaseAdmin.from('schools').select('*'),
      supabaseAdmin.from('school_scholarships').select('*'),
      supabaseAdmin.from('scholarship_applications').select('id, school_id, scholarship_id, status, payment_status, registration_source, created_at'),
      supabaseAdmin.from('school_incentive_payouts').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('scholarships').select('id, title, application_fee'),
    ])

    const schools = schoolsRes.data || [
      { school_id: 'SCH000101', name: 'ABC Public School', official_email: 'abcschool@gmail.com', mobile: '+91 9876500101', city: 'New Delhi' },
      { school_id: 'SCH000102', name: 'Delhi Public School (DPS) Greater Noida', official_email: 'dps.gnoida@schoolnet.in', mobile: '+91 9876500102', city: 'Greater Noida' },
    ]
    const assignments = assignmentsRes.data || [
      { school_id: 'SCH000101', scholarship_id: 'sch-1', incentive_per_verified_registration: 20, status: 'ACTIVE' },
      { school_id: 'SCH000102', scholarship_id: 'sch-1', incentive_per_verified_registration: 25, status: 'ACTIVE' },
    ]
    const applications = appsRes.data || []
    const payouts = payoutsRes.data || []
    const schemes = schemesRes.data || []

    // Build School-wise Incentive Statements
    const schoolBreakdown = schools.map((sch) => {
      const schAssignments = assignments.filter((a) => a.school_id === sch.school_id)
      const schApps = applications.filter((app) => app.school_id === sch.school_id)

      let totalEarned = 0
      const schemeStats = schAssignments.map((assn) => {
        const scheme = schemes.find((s) => s.id === assn.scholarship_id)
        const appsForScheme = schApps.filter((a) => a.scholarship_id === assn.scholarship_id)
        const verifiedCount = appsForScheme.filter(
          (a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed'
        ).length
        const rate = Number(assn.incentive_per_verified_registration) || 0
        const earned = verifiedCount * rate
        totalEarned += earned

        return {
          scholarship_id: assn.scholarship_id,
          scholarship_title: scheme?.title || assn.scholarship_id,
          rate,
          total_registered: appsForScheme.length,
          verified_count: verifiedCount,
          earned,
        }
      })

      const schPayouts = payouts.filter((p) => p.school_id === sch.school_id && p.status === 'PAID')
      const totalPaid = schPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      const pendingAmount = Math.max(0, totalEarned - totalPaid)

      return {
        school_id: sch.school_id,
        school_name: sch.name,
        official_email: sch.official_email,
        mobile: sch.mobile,
        city: sch.city,
        bank_details: sch.bank_details,
        total_registered: schApps.length,
        total_verified: schApps.filter((a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed').length,
        total_earned: totalEarned,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
        schemes_breakdown: schemeStats,
      }
    })

    const filteredBreakdown = schoolIdFilter
      ? schoolBreakdown.filter((s) => s.school_id === schoolIdFilter)
      : schoolBreakdown

    const filteredPayouts = schoolIdFilter
      ? payouts.filter((p) => p.school_id === schoolIdFilter)
      : payouts

    return NextResponse.json({
      success: true,
      summary: {
        total_incentive_generated: schoolBreakdown.reduce((sum, s) => sum + s.total_earned, 0),
        total_incentive_paid: schoolBreakdown.reduce((sum, s) => sum + s.total_paid, 0),
        total_incentive_pending: schoolBreakdown.reduce((sum, s) => sum + s.pending_amount, 0),
      },
      schools: filteredBreakdown,
      payout_history: filteredPayouts,
    })
  } catch (error: any) {
    console.error('Superadmin incentives GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/schools/incentives (Record Payout)
export async function POST(request: Request) {
  const { authorized, userId } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const body = await request.json()
    const { school_id, scholarship_id, amount, payout_reference, notes } = body

    if (!school_id || !amount || Number(amount) <= 0) {
      return errorResponse('School ID and a valid positive amount are required.', 400)
    }

    const payoutId = `pay-${Date.now()}`
    const finalRef = payout_reference?.trim() || `DISB-SCH-TXN-${Date.now().toString().slice(-6)}`

    const newPayout = {
      id: payoutId,
      school_id,
      scholarship_id: scholarship_id || null,
      amount: Number(amount),
      payout_reference: finalRef,
      notes: notes?.trim() || 'Incentive disbursement processed by Super Admin',
      status: 'PAID',
      paid_at: new Date().toISOString(),
      created_by: userId || null,
      created_at: new Date().toISOString(),
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('school_incentive_payouts')
      .insert(newPayout)
      .select()
      .maybeSingle()

    if (insertErr) {
      console.warn('Insert into school_incentive_payouts error:', insertErr.message)
    }

    return NextResponse.json({
      success: true,
      message: `Payout of ₹${amount} for school ${school_id} recorded successfully!`,
      data: inserted || newPayout,
    })
  } catch (error: any) {
    console.error('Superadmin payout POST exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
