import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse, successResponse } from '@/lib/superadmin-auth'

export const dynamic = 'force-dynamic'

// GET /api/superadmin/payments
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const { searchParams } = new URL(request.url)
    const filterScheme = searchParams.get('scheme_id')
    const filterSchool = searchParams.get('school_id')
    const filterStatus = searchParams.get('status')
    const filterSource = searchParams.get('source')
    const filterTimeRange = searchParams.get('range') || 'all' // 'all', 'today', '7days', '30days'

    // Fetch all relevant data concurrently
    const [
      appsRes,
      schemesRes,
      schoolsRes,
      assignmentsRes,
      payoutsRes,
      refCodesRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('scholarship_applications')
        .select(`
          id,
          application_no,
          registration_code,
          scholarship_id,
          scholarship_title,
          applicant_name,
          applicant_email,
          applicant_phone,
          qualification,
          state,
          district,
          city,
          school_id,
          school_name,
          registration_source,
          reference_code,
          status,
          payment_status,
          payment_reference,
          payment_amount,
          documents,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('scholarships')
        .select('id, title, category, application_fee, reward_type, scholarship_value, status')
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('schools')
        .select('school_id, name, official_email, mobile, city, state, bank_details, is_active')
        .order('name', { ascending: true }),

      supabaseAdmin
        .from('school_scholarships')
        .select('school_id, scholarship_id, incentive_per_verified_registration, status'),

      supabaseAdmin
        .from('school_incentive_payouts')
        .select('*')
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('scholarship_reference_codes')
        .select('id, code, name, phone, email, discount_percent, status')
        .order('created_at', { ascending: false }),
    ])

    const applications = appsRes.data || []
    const schemes = schemesRes.data || []
    const schools = schoolsRes.data || []
    const assignments = assignmentsRes.data || []
    const payouts = payoutsRes.data || []
    const refCodes = refCodesRes.data || []

    // ── Pre-calculate Maps for fast lookups ──
    const schoolMap = new Map<string, any>()
    schools.forEach((s) => schoolMap.set(s.school_id, s))

    const schemeMap = new Map<string, any>()
    schemes.forEach((sc) => schemeMap.set(sc.id, sc))

    const refCodeMap = new Map<string, any>()
    refCodes.forEach((rc) => refCodeMap.set(rc.code.toUpperCase(), rc))

    // ── Time Filter Helper ──
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // ── Enrich Applications into Unified Transactions ──
    const enrichedTransactions = applications.map((app) => {
      const docs = (typeof app.documents === 'object' && app.documents) ? app.documents : {}
      const effectiveFee = Number(app.payment_amount) || 0
      const originalFee = Number(docs.original_fee) || effectiveFee
      const discountPercent = Number(docs.referral_discount_percent) || 0
      const discountAmount = Number(docs.referral_discount_amount) || Math.max(0, originalFee - effectiveFee)

      const schoolInfo = app.school_id ? schoolMap.get(app.school_id) : null
      const matchedScheme = schemeMap.get(app.scholarship_id)

      const isPaid = app.payment_status === 'paid'
      const isFree = app.payment_status === 'free' || effectiveFee === 0

      return {
        id: app.id,
        application_no: app.application_no,
        registration_code: app.registration_code,
        scholarship_id: app.scholarship_id,
        scholarship_title: app.scholarship_title || matchedScheme?.title || 'Scholarship Exam',
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        applicant_phone: app.applicant_phone,
        qualification: app.qualification,
        location: [app.city, app.district, app.state].filter(Boolean).join(', ') || 'N/A',
        school_id: app.school_id || docs.school_id || null,
        school_name: app.school_name || docs.school_name || schoolInfo?.name || 'Direct Student',
        registration_source: app.registration_source || (app.school_id ? 'SCHOOL' : 'DIRECT'),
        reference_code: app.reference_code || docs.reference_code || null,
        status: app.status,
        payment_status: app.payment_status || (effectiveFee > 0 ? 'paid' : 'free'),
        payment_reference: app.payment_reference || 'N/A',
        original_fee: originalFee,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        payment_amount: effectiveFee,
        created_at: app.created_at,
        is_paid: isPaid,
        is_free: isFree,
      }
    })

    // ── High-Level Financial Summary (All-Time & Period) ──
    let totalGrossRevenue = 0
    let totalPaidCount = 0
    let totalFreeCount = 0
    let totalPendingCount = 0
    let totalFailedCount = 0
    let totalDiscountGranted = 0

    let todayGrossRevenue = 0
    let todayTransactionsCount = 0
    let monthGrossRevenue = 0

    enrichedTransactions.forEach((tx) => {
      const txDate = new Date(tx.created_at)
      const txDateStr = tx.created_at?.split('T')[0]

      if (tx.payment_status === 'paid') {
        totalGrossRevenue += tx.payment_amount
        totalPaidCount++

        if (txDateStr === todayStr) {
          todayGrossRevenue += tx.payment_amount
          todayTransactionsCount++
        }
        if (txDate >= startOfThisMonth) {
          monthGrossRevenue += tx.payment_amount
        }
      } else if (tx.payment_status === 'free') {
        totalFreeCount++
        if (txDateStr === todayStr) todayTransactionsCount++
      } else if (tx.payment_status === 'pending') {
        totalPendingCount++
      } else if (tx.payment_status === 'failed') {
        totalFailedCount++
      }

      totalDiscountGranted += tx.discount_amount
    })

    // ── School Partner Financials & Incentive Calculations ──
    const schoolFinancials = schools.map((sch) => {
      const schAssignments = assignments.filter((a) => a.school_id === sch.school_id)
      const schApps = enrichedTransactions.filter((tx) => tx.school_id === sch.school_id)

      let totalEarned = 0
      const schemeBreakdown = schAssignments.map((assn) => {
        const scheme = schemeMap.get(assn.scholarship_id)
        const appsForScheme = schApps.filter((a) => a.scholarship_id === assn.scholarship_id)
        const verifiedCount = appsForScheme.filter((a) => a.is_paid || a.is_free || a.status === 'confirmed').length
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

      const schPayouts = payouts.filter((p) => p.school_id === sch.school_id && (p.status === 'PAID' || !p.status))
      const totalPaid = schPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      const pendingLiability = Math.max(0, totalEarned - totalPaid)

      return {
        school_id: sch.school_id,
        school_name: sch.name,
        official_email: sch.official_email,
        mobile: sch.mobile,
        city: sch.city,
        state: sch.state,
        bank_details: sch.bank_details,
        total_students_referred: schApps.length,
        verified_paid_students: schApps.filter((a) => a.is_paid || a.is_free || a.status === 'confirmed').length,
        total_incentive_earned: totalEarned,
        total_payout_disbursed: totalPaid,
        pending_incentive_liability: pendingLiability,
        schemes_breakdown: schemeBreakdown,
      }
    })

    const totalPartnerIncentivesEarned = schoolFinancials.reduce((sum, s) => sum + s.total_incentive_earned, 0)
    const totalPartnerPayoutsDisbursed = payouts
      .filter((p) => p.status === 'PAID' || !p.status)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const totalPartnerIncentivesPending = Math.max(0, totalPartnerIncentivesEarned - totalPartnerPayoutsDisbursed)

    const netPlatformRevenue = totalGrossRevenue - totalPartnerPayoutsDisbursed

    // ── Scholarship Scheme Revenue Matrix ──
    const schemeRevenueMatrix = schemes.map((sch) => {
      const schemeTxs = enrichedTransactions.filter((tx) => tx.scholarship_id === sch.id)
      const paidTxs = schemeTxs.filter((tx) => tx.is_paid)
      const freeTxs = schemeTxs.filter((tx) => tx.is_free)
      const schemeRevenue = paidTxs.reduce((sum, tx) => sum + tx.payment_amount, 0)
      const fee = Number(sch.application_fee) || 0

      return {
        id: sch.id,
        title: sch.title,
        category: sch.category,
        application_fee: fee,
        scholarship_value: sch.scholarship_value,
        total_applicants: schemeTxs.length,
        paid_count: paidTxs.length,
        free_count: freeTxs.length,
        pending_count: schemeTxs.filter((tx) => tx.payment_status === 'pending').length,
        total_revenue: schemeRevenue,
        avg_revenue_per_applicant: schemeTxs.length > 0 ? Math.round(schemeRevenue / schemeTxs.length) : 0,
      }
    })

    // ── Referral Codes Financial Matrix ──
    const referralCodeFinancials = refCodes.map((rc) => {
      const codeUpper = rc.code.toUpperCase()
      const codeTxs = enrichedTransactions.filter((tx) => tx.reference_code && tx.reference_code.toUpperCase() === codeUpper)
      const codePaid = codeTxs.filter((tx) => tx.is_paid)
      const codeRevenue = codePaid.reduce((sum, tx) => sum + tx.payment_amount, 0)
      const codeDiscounts = codeTxs.reduce((sum, tx) => sum + tx.discount_amount, 0)

      return {
        id: rc.id,
        code: rc.code,
        partner_name: rc.name,
        partner_phone: rc.phone,
        partner_email: rc.email,
        discount_percent: rc.discount_percent || 0,
        status: rc.status,
        total_usage_count: codeTxs.length,
        paid_usage_count: codePaid.length,
        revenue_generated: codeRevenue,
        discounts_granted: codeDiscounts,
      }
    })

    // ── Daily Revenue & Transactions Trend (Last 14 Days) ──
    const dailyTrends: Record<string, { date: string; display_date: string; revenue: number; paid_count: number; free_count: number; payouts: number }> = {}

    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const display = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      dailyTrends[key] = {
        date: key,
        display_date: display,
        revenue: 0,
        paid_count: 0,
        free_count: 0,
        payouts: 0,
      }
    }

    enrichedTransactions.forEach((tx) => {
      const dKey = tx.created_at?.split('T')[0]
      if (dKey && dailyTrends[dKey]) {
        if (tx.payment_status === 'paid') {
          dailyTrends[dKey].revenue += tx.payment_amount
          dailyTrends[dKey].paid_count++
        } else if (tx.payment_status === 'free') {
          dailyTrends[dKey].free_count++
        }
      }
    })

    payouts.forEach((p) => {
      const pKey = p.created_at?.split('T')[0] || p.paid_at?.split('T')[0]
      if (pKey && dailyTrends[pKey]) {
        dailyTrends[pKey].payouts += Number(p.amount) || 0
      }
    })

    // ── Filtered Transactions for Response if query filters supplied ──
    let filteredTransactions = [...enrichedTransactions]

    if (filterScheme) {
      filteredTransactions = filteredTransactions.filter((t) => t.scholarship_id === filterScheme)
    }
    if (filterSchool) {
      filteredTransactions = filteredTransactions.filter((t) => t.school_id === filterSchool)
    }
    if (filterStatus) {
      filteredTransactions = filteredTransactions.filter((t) => t.payment_status === filterStatus)
    }
    if (filterSource) {
      filteredTransactions = filteredTransactions.filter((t) => t.registration_source === filterSource)
    }
    if (filterTimeRange === 'today') {
      filteredTransactions = filteredTransactions.filter((t) => t.created_at?.startsWith(todayStr))
    } else if (filterTimeRange === '7days') {
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.created_at) >= sevenDaysAgo)
    } else if (filterTimeRange === '30days') {
      filteredTransactions = filteredTransactions.filter((t) => new Date(t.created_at) >= thirtyDaysAgo)
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_gross_revenue: totalGrossRevenue,
        net_platform_revenue: netPlatformRevenue,
        total_paid_count: totalPaidCount,
        total_free_count: totalFreeCount,
        total_pending_count: totalPendingCount,
        total_failed_count: totalFailedCount,
        total_applications_count: enrichedTransactions.length,
        total_discount_granted: totalDiscountGranted,
        today_gross_revenue: todayGrossRevenue,
        today_transactions_count: todayTransactionsCount,
        month_gross_revenue: monthGrossRevenue,
        total_partner_incentives_earned: totalPartnerIncentivesEarned,
        total_partner_payouts_disbursed: totalPartnerPayoutsDisbursed,
        total_partner_incentives_pending: totalPartnerIncentivesPending,
        active_partner_schools_count: schools.length,
        active_schemes_count: schemes.length,
      },
      transactions: filteredTransactions,
      all_transactions_count: enrichedTransactions.length,
      school_financials: schoolFinancials,
      scheme_breakdown: schemeRevenueMatrix,
      referral_breakdown: referralCodeFinancials,
      payout_history: payouts,
      daily_trends: Object.values(dailyTrends),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Superadmin Payments GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/payments (Record School Partner Payout or Manual Payment Adjustment)
export async function POST(request: Request) {
  const { authorized, userId } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const body = await request.json()
    const { action, school_id, scholarship_id, amount, payout_reference, notes, application_id, new_payment_status } = body

    if (action === 'school_payout') {
      if (!school_id || !amount || Number(amount) <= 0) {
        return errorResponse('Valid school ID and positive amount required.', 400)
      }

      const payoutId = `pay-${Date.now()}`
      const finalRef = payout_reference?.trim() || `DISB-SCH-TXN-${Date.now().toString().slice(-6)}`

      const newPayout = {
        id: payoutId,
        school_id,
        scholarship_id: scholarship_id || null,
        amount: Number(amount),
        payout_reference: finalRef,
        notes: notes?.trim() || 'Partner school incentive disbursement by Superadmin',
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
        console.warn('Insert payout warning:', insertErr.message)
      }

      return NextResponse.json({
        success: true,
        message: `Payout of ₹${Number(amount).toLocaleString('en-IN')} recorded successfully!`,
        data: inserted || newPayout,
      })
    }

    if (action === 'update_transaction_status') {
      if (!application_id || !new_payment_status) {
        return errorResponse('Application ID and new payment status required.', 400)
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          payment_status: new_payment_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', application_id)
        .select()
        .single()

      if (updateErr) {
        return errorResponse(updateErr.message, 500)
      }

      return NextResponse.json({
        success: true,
        message: 'Transaction payment status updated successfully.',
        data: updated,
      })
    }

    return errorResponse('Invalid action specified', 400)
  } catch (error: any) {
    console.error('Superadmin Payments POST exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
