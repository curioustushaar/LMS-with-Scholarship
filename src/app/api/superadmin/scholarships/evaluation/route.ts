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
      const { applicant_id, marks, total_marks, merit_status: customStatus, remarks } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const isAbsent = Boolean(
        String(marks || '').toUpperCase() === 'ABSENT' ||
        String(marks || '').toUpperCase() === 'AB'
      )
      const numMarks = isAbsent ? 0 : parseFloat(marks)
      const maxMarks = total_marks ? parseFloat(total_marks) : 100
      
      let computedStatus: 'qualified' | 'waiting' | 'not_qualified' = 'not_qualified'
      if (customStatus && ['qualified', 'waiting', 'not_qualified'].includes(customStatus)) {
        computedStatus = customStatus
      } else if (!isAbsent) {
        computedStatus = numMarks >= maxMarks * 0.5 ? 'qualified' : 'not_qualified'
      }

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
        attendance: isAbsent ? 'ABSENT' : 'PRESENT',
        examiner_remarks: remarks || targetApplicant.documents?.examiner_remarks || '',
      }

      // 2. Update target marks & status
      const { error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          exam_marks: isAbsent ? 0 : numMarks,
          total_marks: maxMarks,
          merit_status: computedStatus,
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

      if (schemeApplicants && schemeApplicants.length > 0) {
        const presentApps = schemeApplicants.filter((a) => a.documents?.attendance !== 'ABSENT')
        const absentApps = schemeApplicants.filter((a) => a.documents?.attendance === 'ABSENT')

        presentApps.sort((a, b) => {
          if ((b.exam_marks || 0) !== (a.exam_marks || 0)) {
            return (b.exam_marks || 0) - (a.exam_marks || 0)
          }
          return (b.percentage || 0) - (a.percentage || 0)
        })

        const rankUpdates = presentApps.map((app, idx) =>
          supabaseAdmin
            .from('scholarship_applications')
            .update({ rank: idx + 1, updated_at: new Date().toISOString() })
            .eq('id', app.id)
        )
        const unrankUpdates = absentApps.map((app) =>
          supabaseAdmin
            .from('scholarship_applications')
            .update({ rank: null, updated_at: new Date().toISOString() })
            .eq('id', app.id)
        )
        await Promise.all([...rankUpdates, ...unrankUpdates])
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
        message: 'Marks and merit status updated successfully!',
        applicants: normalized,
      })
    } else if (action === 'apply_cutoff_rules') {
      const {
        scheme_id = 'all',
        mode = 'marks_range',
        qualified_min = 60,
        top_qualified_count = 50,
      } = body

      let query = supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .not('exam_marks', 'is', null)

      if (scheme_id && scheme_id !== 'all') {
        query = query.eq('scholarship_id', scheme_id)
      }

      const { data: targetApps, error: fetchErr } = await query

      if (fetchErr || !targetApps) {
        return NextResponse.json({ success: false, error: 'Failed to fetch applicants: ' + fetchErr?.message }, { status: 500 })
      }

      if (targetApps.length === 0) {
        return NextResponse.json({ success: false, error: 'No scored candidates found in the selected scheme to apply cut-off.' }, { status: 400 })
      }

      let qualCount = 0
      let notQualCount = 0
      let absentCount = 0

      const updates: Array<{ id: string; merit_status: 'qualified' | 'not_qualified'; scholarship_id: string }> = []
      const affectedSchemeIds = new Set<string>()

      if (mode === 'top_ranks') {
        // Group by scholarship_id and assign based on rank
        const groupedByScheme: Record<string, any[]> = {}
        targetApps.forEach((app) => {
          if (!groupedByScheme[app.scholarship_id]) groupedByScheme[app.scholarship_id] = []
          groupedByScheme[app.scholarship_id].push(app)
        })

        for (const [sId, apps] of Object.entries(groupedByScheme)) {
          affectedSchemeIds.add(sId)
          const present = apps.filter((a) => a.documents?.attendance !== 'ABSENT')
          const absent = apps.filter((a) => a.documents?.attendance === 'ABSENT')

          present.sort((a, b) => (b.exam_marks || 0) - (a.exam_marks || 0))

          present.forEach((app, idx) => {
            const rankIndex = idx + 1
            let st: 'qualified' | 'not_qualified' = 'not_qualified'
            if (rankIndex <= top_qualified_count) {
              st = 'qualified'
              qualCount++
            } else {
              st = 'not_qualified'
              notQualCount++
            }
            updates.push({ id: app.id, merit_status: st, scholarship_id: sId })
          })

          absent.forEach((app) => {
            absentCount++
            updates.push({ id: app.id, merit_status: 'not_qualified', scholarship_id: sId })
          })
        }
      } else {
        // Marks range mode: qualified_min (e.g. 60)
        const qMin = parseFloat(qualified_min)

        targetApps.forEach((app) => {
          affectedSchemeIds.add(app.scholarship_id)
          const isAbsent = app.documents?.attendance === 'ABSENT'
          const marks = app.exam_marks != null ? Number(app.exam_marks) : 0

          let st: 'qualified' | 'not_qualified' = 'not_qualified'
          if (isAbsent) {
            absentCount++
            st = 'not_qualified'
          } else if (marks >= qMin) {
            st = 'qualified'
            qualCount++
          } else {
            st = 'not_qualified'
            notQualCount++
          }
          updates.push({ id: app.id, merit_status: st, scholarship_id: app.scholarship_id })
        })
      }

      // Batch update in parallel chunks
      const CHUNK_SIZE = 50
      for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const chunk = updates.slice(i, i + CHUNK_SIZE)
        await Promise.all(
          chunk.map((item) =>
            supabaseAdmin
              .from('scholarship_applications')
              .update({ merit_status: item.merit_status, updated_at: new Date().toISOString() })
              .eq('id', item.id)
          )
        )
      }

      // Recompute ranks
      for (const schemeId of Array.from(affectedSchemeIds)) {
        const { data: schemeApps } = await supabaseAdmin
          .from('scholarship_applications')
          .select('id, exam_marks, percentage, documents')
          .eq('scholarship_id', schemeId)
          .not('exam_marks', 'is', null)

        if (schemeApps && schemeApps.length > 0) {
          const presentApps = schemeApps.filter((a) => a.documents?.attendance !== 'ABSENT')
          const absentApps = schemeApps.filter((a) => a.documents?.attendance === 'ABSENT')

          presentApps.sort((a, b) => {
            if ((b.exam_marks || 0) !== (a.exam_marks || 0)) {
              return (b.exam_marks || 0) - (a.exam_marks || 0)
            }
            return (b.percentage || 0) - (a.percentage || 0)
          })

          const rankPromises = presentApps.map((app, idx) =>
            supabaseAdmin
              .from('scholarship_applications')
              .update({ rank: idx + 1, updated_at: new Date().toISOString() })
              .eq('id', app.id)
          )
          const unrankPromises = absentApps.map((app) =>
            supabaseAdmin
              .from('scholarship_applications')
              .update({ rank: null, updated_at: new Date().toISOString() })
              .eq('id', app.id)
          )
          await Promise.all([...rankPromises, ...unrankPromises])
        }
      }

      // Refreshed response
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
        message: `Cut-off rules successfully applied to ${updates.length} candidates: ${qualCount} Qualified, ${notQualCount} Not Qualified.`,
        summary: {
          total: updates.length,
          qualified: qualCount,
          not_qualified: notQualCount,
          absent: absentCount,
        },
        applicants: normalized,
      })
    } else if (action === 'bulk_upload_marks') {
      const { scholarship_id, total_marks = 100, records = [] } = body
      if (!Array.isArray(records) || records.length === 0) {
        return NextResponse.json({ success: false, error: 'No marks records provided.' }, { status: 400 })
      }

      const defaultMax = Number(total_marks) > 0 ? Number(total_marks) : 100

      // 1. Fetch relevant scholarship applicants to match against
      let query = supabaseAdmin.from('scholarship_applications').select('*')
      if (scholarship_id && scholarship_id !== 'all') {
        query = query.eq('scholarship_id', scholarship_id)
      }
      const { data: dbApplicants, error: fetchErr } = await query

      if (fetchErr || !dbApplicants) {
        return NextResponse.json({ success: false, error: 'Failed to fetch applicants: ' + fetchErr?.message }, { status: 500 })
      }

      // Build resilient lookup maps
      const normalizeKey = (val: any) => String(val || '').trim().toLowerCase().replace(/[\s\-_]/g, '')
      const byId = new Map<string, any>()
      const byRoll = new Map<string, any>()
      const byAppNo = new Map<string, any>()

      dbApplicants.forEach((app) => {
        byId.set(app.id, app)
        if (app.roll_number) byRoll.set(normalizeKey(app.roll_number), app)
        if (app.application_no) byAppNo.set(normalizeKey(app.application_no), app)
      })

      const updates: Array<{ id: string; payload: any; scholarship_id: string }> = []
      const errors: Array<{ row: number; identifier: string; reason: string }> = []
      let absentCount = 0
      const affectedSchemeIds = new Set<string>()

      for (let i = 0; i < records.length; i++) {
        const row = records[i]
        const rowNum = i + 1
        const rawRoll = row.roll_number ? String(row.roll_number).trim() : ''
        const rawAppNo = row.application_no ? String(row.application_no).trim() : ''
        const rawId = row.applicant_id ? String(row.applicant_id).trim() : ''

        // Find candidate
        let matched: any = null
        if (rawId && byId.has(rawId)) {
          matched = byId.get(rawId)
        } else if (rawRoll && byRoll.has(normalizeKey(rawRoll))) {
          matched = byRoll.get(normalizeKey(rawRoll))
        } else if (rawAppNo && byAppNo.has(normalizeKey(rawAppNo))) {
          matched = byAppNo.get(normalizeKey(rawAppNo))
        }

        const identifier = rawRoll || rawAppNo || rawId || row.applicant_name || `Row ${rowNum}`

        if (!matched) {
          errors.push({ row: rowNum, identifier, reason: 'Student not found in this scholarship scheme' })
          continue
        }

        const isAbsent = Boolean(
          row.is_absent ||
          String(row.attendance || '').toUpperCase() === 'ABSENT' ||
          String(row.marks || '').toUpperCase() === 'ABSENT' ||
          String(row.marks || '').toUpperCase() === 'AB'
        )

        let numMarks = 0
        let isPass = false
        const maxMarks = row.total_marks ? Number(row.total_marks) : defaultMax

        if (isAbsent) {
          absentCount++
          numMarks = 0
          isPass = false
        } else {
          numMarks = parseFloat(row.marks)
          if (isNaN(numMarks) || numMarks < 0) {
            errors.push({ row: rowNum, identifier, reason: `Invalid marks value: "${row.marks}". Must be a number >= 0.` })
            continue
          }
          if (numMarks > maxMarks) {
            errors.push({ row: rowNum, identifier, reason: `Marks (${numMarks}) exceed maximum marks (${maxMarks}).` })
            continue
          }
          isPass = numMarks >= maxMarks * 0.5
        }

        const updatedDocs = {
          ...(matched.documents || {}),
          result_status: 'draft',
          attendance: isAbsent ? 'ABSENT' : 'PRESENT',
          evaluated_via: 'BULK_IMPORT',
          evaluated_at: new Date().toISOString(),
        }

        updates.push({
          id: matched.id,
          scholarship_id: matched.scholarship_id,
          payload: {
            exam_marks: isAbsent ? 0 : numMarks,
            total_marks: maxMarks,
            merit_status: isAbsent ? 'not_qualified' : (isPass ? 'qualified' : 'not_qualified'),
            documents: updatedDocs,
            updated_at: new Date().toISOString(),
          },
        })

        affectedSchemeIds.add(matched.scholarship_id)
      }

      // 2. Batch update matching records in parallel chunks of 50
      const CHUNK_SIZE = 50
      for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const chunk = updates.slice(i, i + CHUNK_SIZE)
        await Promise.all(
          chunk.map((item) =>
            supabaseAdmin
              .from('scholarship_applications')
              .update(item.payload)
              .eq('id', item.id)
          )
        )
      }

      // 3. Recompute Scheme Ranks for each affected scholarship
      for (const schemeId of Array.from(affectedSchemeIds)) {
        const { data: schemeApps } = await supabaseAdmin
          .from('scholarship_applications')
          .select('id, exam_marks, percentage, documents')
          .eq('scholarship_id', schemeId)
          .not('exam_marks', 'is', null)

        if (schemeApps && schemeApps.length > 0) {
          // Filter out absent candidates from ranking or put them at the bottom
          const presentApps = schemeApps.filter((a) => a.documents?.attendance !== 'ABSENT')
          const absentApps = schemeApps.filter((a) => a.documents?.attendance === 'ABSENT')

          // Sort present candidates by marks DESC, tie-break with percentage DESC
          presentApps.sort((a, b) => {
            if ((b.exam_marks || 0) !== (a.exam_marks || 0)) {
              return (b.exam_marks || 0) - (a.exam_marks || 0)
            }
            return (b.percentage || 0) - (a.percentage || 0)
          })

          const rankPromises = presentApps.map((app, idx) =>
            supabaseAdmin
              .from('scholarship_applications')
              .update({ rank: idx + 1, updated_at: new Date().toISOString() })
              .eq('id', app.id)
          )

          const unrankPromises = absentApps.map((app) =>
            supabaseAdmin
              .from('scholarship_applications')
              .update({ rank: null, updated_at: new Date().toISOString() })
              .eq('id', app.id)
          )

          await Promise.all([...rankPromises, ...unrankPromises])
        }
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
        message: `Bulk evaluation completed! Successfully scored ${updates.length} candidates (${absentCount} marked absent), generated ranks instantly.`,
        processed_count: updates.length,
        absent_count: absentCount,
        failed_count: errors.length,
        errors,
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
