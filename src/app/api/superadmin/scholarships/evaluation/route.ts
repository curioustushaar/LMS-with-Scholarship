import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

// Helper to normalize applicant result status
function normalizeApplicant(app: any, schemesMap: Record<string, any>) {
  const scheme = schemesMap[app.scholarship_id]
  const docResultStatus = app.documents?.result_status
  const isReleased = docResultStatus === 'released' || scheme?.status === 'results_declared'
  return {
    ...app,
    result_status: isReleased ? 'released' : 'draft',
    result_released_at: app.documents?.result_released_at || null,
    document_remarks: app.documents?.document_remarks || null,
    verification_checklist: app.documents?.verification_checklist || null,
    award_voucher_code: app.documents?.award_voucher_code || null,
    payout_details: app.documents?.payout_details || null,
    bank_details: app.documents?.bank_details || null,
    cheque_details: app.documents?.cheque_details || null,
  }
}

// GET /api/superadmin/scholarships/evaluation
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [applicantsRes, schemesRes] = await Promise.all([
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (applicantsRes.error) {
      return NextResponse.json({ success: false, error: applicantsRes.error.message }, { status: 500 })
    }

    const schemes = schemesRes.data || []
    const schemesMap = schemes.reduce((acc: Record<string, any>, s: any) => {
      acc[s.id] = s
      return acc
    }, {})

    const normalizedApplicants = (applicantsRes.data || []).map((app) => normalizeApplicant(app, schemesMap))

    return NextResponse.json({
      success: true,
      applicants: normalizedApplicants,
      schemes: schemes,
    })
  } catch (error: any) {
    console.error('Evaluation GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/scholarships/evaluation
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'submit_marks') {
      const { applicant_id, marks, total_marks } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const numMarks = parseFloat(marks)
      const maxMarks = total_marks ? parseFloat(total_marks) : 100
      const pass = numMarks >= maxMarks * 0.5

      // 1. Fetch current target applicant to get scholarship_id
      const { data: targetApplicant, error: fetchErr } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('id', applicant_id)
        .single()

      if (fetchErr || !targetApplicant) {
        return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
      }

      const updatedDocs = {
        ...(targetApplicant.documents || {}),
        result_status: targetApplicant.documents?.result_status || 'draft',
      }

      // 2. Update target marks & status
      const { error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          exam_marks: numMarks,
          total_marks: maxMarks,
          merit_status: pass ? 'qualified' : 'not_qualified',
          documents: updatedDocs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (updateErr) {
        console.error('Update marks error:', updateErr)
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      // 3. Recompute ranks for all applicants in this scholarship scheme
      const { data: schemeApplicants } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('scholarship_id', targetApplicant.scholarship_id)
        .not('exam_marks', 'is', null)
        .order('exam_marks', { ascending: false })

      if (schemeApplicants && schemeApplicants.length > 0) {
        const rankUpdates = schemeApplicants.map((app, idx) =>
          supabaseAdmin
            .from('scholarship_applications')
            .update({ rank: idx + 1, updated_at: new Date().toISOString() })
            .eq('id', app.id)
        )
        await Promise.all(rankUpdates)
      }

      // 4. Fetch refreshed list
      const [allAppsRes, allSchemesRes] = await Promise.all([
        supabaseAdmin.from('scholarship_applications').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('scholarships').select('*').order('created_at', { ascending: false }),
      ])

      const schemesMap = (allSchemesRes.data || []).reduce((acc: Record<string, any>, s: any) => {
        acc[s.id] = s
        return acc
      }, {})

      const normalized = (allAppsRes.data || []).map((app) => normalizeApplicant(app, schemesMap))

      return NextResponse.json({
        success: true,
        message: 'Marks updated and merit ranks recomputed successfully!',
        applicants: normalized,
      })
    } else if (action === 'bulk_release_results') {
      const { scheme_id } = body

      let schemesQuery = supabaseAdmin.from('scholarships').select('*')
      if (scheme_id && scheme_id !== 'all') {
        schemesQuery = schemesQuery.eq('id', scheme_id)
      }
      const { data: targetSchemes } = await schemesQuery

      if (!targetSchemes || targetSchemes.length === 0) {
        return NextResponse.json({ success: false, error: 'No schemes found to release results.' }, { status: 404 })
      }

      let totalReleased = 0

      for (const scheme of targetSchemes) {
        const { data: schemeApps } = await supabaseAdmin
          .from('scholarship_applications')
          .select('*')
          .eq('scholarship_id', scheme.id)
          .not('exam_marks', 'is', null)
          .order('exam_marks', { ascending: false })

        if (schemeApps && schemeApps.length > 0) {
          totalReleased += schemeApps.length
          const prizeDist = scheme.prize_distribution || {}

          const updates = schemeApps.map((app, idx) => {
            const rankNum = idx + 1
            let awardAmount = app.award_amount
            let awardType = app.award_type || 'fee_waiver'
            let awardStatus = app.award_status || 'awarded'

            if (rankNum === 1) {
              awardAmount = prizeDist.first_prize || '🥇 1st Prize Winner: ₹50,000 + 100% Fee Waiver'
              awardType = 'both'
              awardStatus = 'awarded'
            } else if (rankNum === 2) {
              awardAmount = prizeDist.second_prize || '🥈 2nd Prize Winner: ₹25,000 + 75% Fee Waiver'
              awardType = 'both'
              awardStatus = 'awarded'
            } else if (rankNum === 3) {
              awardAmount = prizeDist.third_prize || '🥉 3rd Prize Winner: ₹10,000 + 50% Fee Waiver'
              awardType = 'both'
              awardStatus = 'awarded'
            } else if (app.merit_status === 'qualified') {
              awardAmount = prizeDist.consolation || 'Merit Certificate & 50% Fee Waiver'
              awardType = 'fee_waiver'
              awardStatus = 'awarded'
            }

            const updatedDocs = {
              ...(app.documents || {}),
              result_status: 'released',
              result_released_at: new Date().toISOString(),
              award_voucher_code: app.documents?.award_voucher_code || `AAGAJ-SCH-100-${app.application_no ? app.application_no.slice(-4) : '2026'}`,
            }

            return supabaseAdmin
              .from('scholarship_applications')
              .update({
                rank: rankNum,
                award_status: awardStatus,
                award_type: awardType,
                award_amount: awardAmount,
                award_disbursement_ref: app.award_disbursement_ref || `AWARD-${scheme.id.slice(-4)}-${app.application_no ? app.application_no.slice(-4) : '001'}`,
                documents: updatedDocs,
                updated_at: new Date().toISOString(),
              })
              .eq('id', app.id)
          })

          await Promise.all(updates)
        }

        await supabaseAdmin
          .from('scholarships')
          .update({ status: 'results_declared', updated_at: new Date().toISOString() })
          .eq('id', scheme.id)
      }

      const [allAppsRes, allSchemesRes] = await Promise.all([
        supabaseAdmin.from('scholarship_applications').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('scholarships').select('*').order('created_at', { ascending: false }),
      ])

      const schemesMap = (allSchemesRes.data || []).reduce((acc: Record<string, any>, s: any) => {
        acc[s.id] = s
        return acc
      }, {})

      const normalized = (allAppsRes.data || []).map((app) => normalizeApplicant(app, schemesMap))

      return NextResponse.json({
        success: true,
        message: `Successfully released and published results for ${totalReleased} evaluated candidates! Top 3 prizes assigned automatically.`,
        count: totalReleased,
        applicants: normalized,
      })
    } else if (action === 'revert_results_to_draft') {
      const { scheme_id } = body
      if (!scheme_id) return NextResponse.json({ success: false, error: 'Scheme ID is required' }, { status: 400 })

      let appsQuery = supabaseAdmin.from('scholarship_applications').select('*')
      if (scheme_id !== 'all') {
        appsQuery = appsQuery.eq('scholarship_id', scheme_id)
        await supabaseAdmin
          .from('scholarships')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('id', scheme_id)
      } else {
        await supabaseAdmin
          .from('scholarships')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('status', 'results_declared')
      }

      const { data: targetApps } = await appsQuery
      if (targetApps && targetApps.length > 0) {
        const revertUpdates = targetApps.map((app) => {
          const newDocs = {
            ...(app.documents || {}),
            result_status: 'draft',
          }
          return supabaseAdmin
            .from('scholarship_applications')
            .update({ documents: newDocs, updated_at: new Date().toISOString() })
            .eq('id', app.id)
        })
        await Promise.all(revertUpdates)
      }

      return NextResponse.json({
        success: true,
        message: 'Results reverted to draft state. Public portal results have been hidden.',
      })
    } else if (action === 'verify_document') {
      const { applicant_id, document_status, document_remarks, checklist } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const { data: targetApplicant, error: fetchErr } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('id', applicant_id)
        .single()

      if (fetchErr || !targetApplicant) {
        return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
      }

      const updatedDocs = {
        ...(targetApplicant.documents || {}),
        document_remarks: document_remarks || '',
        verification_checklist: checklist || {},
        verified_at: new Date().toISOString(),
      }

      const { error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          document_status: document_status || 'verified',
          documents: updatedDocs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      // Fetch refreshed
      const [allAppsRes, allSchemesRes] = await Promise.all([
        supabaseAdmin.from('scholarship_applications').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('scholarships').select('*').order('created_at', { ascending: false }),
      ])

      const schemesMap = (allSchemesRes.data || []).reduce((acc: Record<string, any>, s: any) => {
        acc[s.id] = s
        return acc
      }, {})

      const normalized = (allAppsRes.data || []).map((app) => normalizeApplicant(app, schemesMap))

      return NextResponse.json({
        success: true,
        message: `Candidate document dossier marked as ${document_status.toUpperCase()} successfully!`,
        applicants: normalized,
      })
    } else if (action === 'award_scholarship') {
      const { applicant_id, award_type, award_amount, disbursement_ref, voucher_code, payout_details, cheque_details } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const { data: targetApplicant, error: fetchErr } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('id', applicant_id)
        .single()

      if (fetchErr || !targetApplicant) {
        return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
      }

      const updatedDocs = {
        ...(targetApplicant.documents || {}),
        award_voucher_code: voucher_code || `AAGAJ-SCH-100-${targetApplicant.application_no ? targetApplicant.application_no.slice(-4) : '2026'}`,
        payout_details: payout_details || {
          bank_utr: disbursement_ref,
          amount: award_amount,
          disbursed_at: new Date().toISOString(),
          status: 'completed',
        },
        cheque_details: cheque_details || {
          cheque_no: `CQ-${Math.floor(100000 + Math.random() * 900000)}`,
          issue_date: new Date().toISOString().split('T')[0],
          signatory: 'Academic Evaluation & Award Directorate',
        },
        disbursed_at: new Date().toISOString(),
      }

      const { error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          award_status: 'awarded',
          award_type: award_type || 'both',
          award_amount: award_amount || '100% Tuition Fee Waiver',
          award_disbursement_ref: disbursement_ref || `DISB-2026-TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          documents: updatedDocs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      // Fetch refreshed
      const [allAppsRes, allSchemesRes] = await Promise.all([
        supabaseAdmin.from('scholarship_applications').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('scholarships').select('*').order('created_at', { ascending: false }),
      ])

      const schemesMap = (allSchemesRes.data || []).reduce((acc: Record<string, any>, s: any) => {
        acc[s.id] = s
        return acc
      }, {})

      const normalized = (allAppsRes.data || []).map((app) => normalizeApplicant(app, schemesMap))

      return NextResponse.json({
        success: true,
        message: 'Scholarship grant & benefits officially disbursed and allocated to student!',
        applicants: normalized,
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid evaluation action' }, { status: 400 })
  } catch (error: any) {
    console.error('Evaluation POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
