import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/public/scholarships/merit-list?scheme_id=...&query=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const schemeId = searchParams.get('scheme_id')
    const query = searchParams.get('query')
    const lookupAppNo = searchParams.get('lookup_app_no')

    const [applicantsRes, schemesRes] = await Promise.all([
      supabaseAdmin
        .from('scholarship_applications')
        .select('*, scholarships(*)')
        .order('rank', { ascending: true }),
      supabaseAdmin
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (applicantsRes.error) {
      return NextResponse.json({ success: false, error: applicantsRes.error.message }, { status: 500 })
    }

    const allApplicants = applicantsRes.data || []
    const schemes = schemesRes.data || []

    // If student is checking their individual scorecard:
    if (lookupAppNo?.trim()) {
      const needle = lookupAppNo.trim().toLowerCase()
      const candidate = allApplicants.find(
        (a) =>
          (a.application_no && a.application_no.toLowerCase() === needle) ||
          (a.roll_number && a.roll_number.toLowerCase() === needle) ||
          (a.registration_code && a.registration_code.toLowerCase() === needle) ||
          (a.applicant_email && a.applicant_email.toLowerCase() === needle)
      )

      if (!candidate) {
        return NextResponse.json({
          success: false,
          error: 'No application found with provided Roll No or Application Number.',
        }, { status: 404 })
      }

      const scheme = candidate.scholarships
      const docResultStatus = candidate.documents?.result_status
      const isReleased = docResultStatus === 'released' || scheme?.status === 'results_declared'
      const meritStatus = candidate.merit_status || (candidate.exam_marks != null && candidate.exam_marks >= 60 ? 'qualified' : 'not_qualified')
      const isQualified = meritStatus === 'qualified'

      const prizeDist = scheme?.prize_distribution || {}
      let defaultAwardAmount: string | null = null
      let voucherCode: string | null = null

      if (isQualified) {
        if (candidate.rank === 1) defaultAwardAmount = prizeDist.first_prize || '🥇 1st Prize Winner: ₹50,000 Cash + 100% Fee Waiver'
        else if (candidate.rank === 2) defaultAwardAmount = prizeDist.second_prize || '🥈 2nd Prize Winner: ₹25,000 Cash + 75% Fee Waiver'
        else if (candidate.rank === 3) defaultAwardAmount = prizeDist.third_prize || '🥉 3rd Prize Winner: ₹10,000 Cash + 50% Fee Waiver'
        else defaultAwardAmount = prizeDist.consolation || 'Merit Certificate & 50% Fee Waiver'
        voucherCode = candidate.documents?.award_voucher_code || `GRAVITY-SCH-100-${candidate.application_no ? candidate.application_no.slice(-4) : '2026'}`
      } else {
        defaultAwardAmount = null
      }

      const bankDetails = isQualified ? (candidate.documents?.bank_details || null) : null
      const payoutDetails = isQualified ? (candidate.documents?.payout_details || null) : null

      return NextResponse.json({
        success: true,
        individual_scorecard: {
          id: candidate.id,
          application_no: candidate.application_no,
          roll_number: candidate.roll_number || 'GRAVITY-26-XXXX',
          registration_code: candidate.registration_code || `REG-${candidate.id.slice(-6)}`,
          applicant_name: candidate.applicant_name,
          applicant_email: candidate.applicant_email,
          applicant_phone: candidate.applicant_phone,
          father_name: candidate.father_name,
          mother_name: candidate.mother_name,
          dob: candidate.dob,
          gender: candidate.gender || 'N/A',
          category: candidate.category || 'General',
          qualification: candidate.qualification,
          school_college_name: candidate.school_college_name,
          photo_url: candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
          signature_url: candidate.signature_url,
          scholarship_title: candidate.scholarship_title,
          scholarship_value: scheme?.scholarship_value || 'Tuition Fee Waiver',
          exam_center: candidate.exam_center || candidate.exam_city_preference || scheme?.exam_venue || 'National Proctored Online Hub',
          exam_date: scheme?.exam_date || '2026-09-20',
          exam_mode: scheme?.exam_mode || 'Online',
          exam_marks: candidate.exam_marks,
          total_marks: candidate.total_marks || 100,
          percentage_score: candidate.exam_marks != null ? `${((candidate.exam_marks / (candidate.total_marks || 100)) * 100).toFixed(1)}%` : 'N/A',
          rank: isQualified ? candidate.rank : null,
          merit_status: meritStatus,
          document_status: candidate.document_status || 'pending',
          document_remarks: candidate.documents?.document_remarks || null,
          award_status: isQualified ? (candidate.award_status || 'awarded') : 'none',
          award_type: isQualified ? (candidate.award_type || 'both') : 'none',
          award_amount: isQualified ? (candidate.award_amount || defaultAwardAmount) : defaultAwardAmount,
          award_disbursement_ref: isQualified ? (candidate.award_disbursement_ref || `AWARD-GRAVITY-${candidate.application_no ? candidate.application_no.slice(-4) : '001'}`) : `REF-GRAVITY-${candidate.application_no ? candidate.application_no.slice(-4) : '001'}`,
          award_voucher_code: voucherCode,
          bank_details: bankDetails,
          payout_details: payoutDetails,
          result_status: isReleased ? 'OFFICIAL RESULT DECLARED' : 'EVALUATION IN PROGRESS (DRAFT)',
          is_released: isReleased,
          released_at: candidate.documents?.result_released_at || candidate.updated_at || new Date().toISOString(),
        }
      })
    }

    // Filter applicants: only those that have marks and whose result is RELEASED
    let releasedApplicants = allApplicants.filter(
      (app) => app.exam_marks !== null && (app.documents?.result_status === 'released' || app.scholarships?.status === 'results_declared')
    )

    if (schemeId && schemeId !== 'all') {
      releasedApplicants = releasedApplicants.filter((app) => app.scholarship_id === schemeId)
    }

    if (query?.trim()) {
      const q = query.trim().toLowerCase()
      releasedApplicants = releasedApplicants.filter(
        (app) =>
          app.applicant_name.toLowerCase().includes(q) ||
          app.application_no.toLowerCase().includes(q) ||
          (app.roll_number && app.roll_number.toLowerCase().includes(q))
      )
    }

    // Sort by rank ascending
    releasedApplicants.sort((a, b) => (a.rank || 999) - (b.rank || 999))

    // Top 3 Winners extraction
    const topThreeList = releasedApplicants
      .filter((app) => app.rank && app.rank <= 3)
      .slice(0, 3)
      .map((app) => {
        const scheme = app.scholarships
        const prizeDist = scheme?.prize_distribution || {}
        let prizeTag = app.award_amount
        if (app.rank === 1) prizeTag = prizeDist.first_prize || '₹50,000 + 100% Fee Waiver'
        if (app.rank === 2) prizeTag = prizeDist.second_prize || '₹25,000 + 75% Fee Waiver'
        if (app.rank === 3) prizeTag = prizeDist.third_prize || '₹10,000 + 50% Fee Waiver'

        return {
          id: app.id,
          rank: app.rank,
          applicant_name: app.applicant_name,
          roll_number: app.roll_number || `GRAVITY-26-${app.application_no.slice(-4)}`,
          scholarship_title: app.scholarship_title,
          exam_marks: app.exam_marks,
          total_marks: app.total_marks || 100,
          photo_url: app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
          prize_amount: prizeTag,
          qualification: app.qualification,
        }
      })

    return NextResponse.json({
      success: true,
      top_three: topThreeList,
      schemes: schemes.map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        value: s.scholarship_value,
        exam_date: s.exam_date,
        min_percentage: s.min_percentage,
        status: s.status,
        is_results_declared: s.status === 'results_declared',
        total_candidates: allApplicants.filter((a) => a.scholarship_id === s.id).length,
        evaluated_count: allApplicants.filter((a) => a.scholarship_id === s.id && a.exam_marks !== null).length,
        released_count: allApplicants.filter((a) => a.scholarship_id === s.id && (a.documents?.result_status === 'released' || a.scholarships?.status === 'results_declared')).length,
      })),
      merit_list: releasedApplicants.map((app) => ({
        id: app.id,
        rank: app.rank,
        roll_number: app.roll_number || `GRAVITY-26-${app.application_no.slice(-4)}`,
        applicant_name: app.applicant_name,
        scholarship_title: app.scholarship_title,
        photo_url: app.photo_url,
        exam_marks: app.exam_marks,
        total_marks: app.total_marks || 100,
        percentage_score: `${app.exam_marks}%`,
        merit_status: app.merit_status || 'qualified',
        document_status: app.document_status || 'verified',
        award_status: app.award_status || 'awarded',
        award_type: app.award_type || 'fee_waiver',
        award_amount: app.award_amount || 'Tuition Fee Waiver',
        award_disbursement_ref: app.award_disbursement_ref || `TXN-GRAVITY-${app.id.slice(-6)}`,
      })),
    })
  } catch (error: any) {
    console.error('Public merit list API exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/public/scholarships/merit-list (Student submits bank details for cash prize claim)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, application_no, registration_code, bank_name, account_number, ifsc_code, account_holder_name, upi_id } = body

    if (action === 'submit_bank_details') {
      if (!application_no || !registration_code) {
        return NextResponse.json({ success: false, error: 'Application number and registration code required.' }, { status: 400 })
      }

      const { data: targetApplicant, error: fetchErr } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('application_no', application_no.trim())
        .single()

      if (fetchErr || !targetApplicant) {
        return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
      }

      if (targetApplicant.registration_code?.trim().toLowerCase() !== registration_code.trim().toLowerCase()) {
        return NextResponse.json({ success: false, error: 'Invalid security Registration Code.' }, { status: 403 })
      }

      const updatedDocs = {
        ...(targetApplicant.documents || {}),
        bank_details: {
          bank_name: bank_name || '',
          account_number: account_number || '',
          ifsc_code: ifsc_code || '',
          account_holder_name: account_holder_name || targetApplicant.applicant_name,
          upi_id: upi_id || '',
          submitted_at: new Date().toISOString(),
        }
      }

      const { error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          documents: updatedDocs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetApplicant.id)

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Bank / UPI payout details successfully submitted! Admin will process your cash prize grant.',
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Public bank submission error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
