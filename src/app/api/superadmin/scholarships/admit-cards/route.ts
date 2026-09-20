import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'
import { parseCenterTimingFromLandmark } from '@/lib/exam-center-timings'
import { sendAnnouncementEmail } from '@/lib/email'

// GET /api/superadmin/scholarships/admit-cards
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [applicantsRes, schemesRes, centersRes] = await Promise.all([
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('exam_centers')
        .select('*')
        .eq('status', 'active')
        .order('state', { ascending: true })
    ])

    if (applicantsRes.error) {
      console.error('Error fetching applicants:', applicantsRes.error)
      return NextResponse.json({ success: false, error: applicantsRes.error.message }, { status: 500 })
    }

    const applicants = applicantsRes.data || []
    const schemes = schemesRes.data || []
    const centers = centersRes.data || []

    // Calculate Demographic Breakdown (State & District applicant density)
    const demographics: Record<string, { total: number; districts: Record<string, number> }> = {}
    let allocatedCount = 0
    let unallocatedCount = 0

    applicants.forEach((app: any) => {
      const state = app.preference_state || app.state || app.documents?.preference_state || app.documents?.state || 'Unknown State'
      const district = app.preference_district_1 || app.district || app.city || app.documents?.preference_district_1 || app.documents?.district || 'Unknown District'

      if (!demographics[state]) {
        demographics[state] = { total: 0, districts: {} }
      }
      demographics[state].total += 1
      demographics[state].districts[district] = (demographics[state].districts[district] || 0) + 1

      if (app.assigned_center_id || app.exam_center) {
        allocatedCount += 1
      } else {
        unallocatedCount += 1
      }
    })

    return NextResponse.json({
      success: true,
      applicants,
      schemes,
      centers,
      demographics,
      stats: {
        total_applicants: applicants.length,
        provisional: applicants.filter((a) => a.admit_card_status === 'provisional').length,
        released: applicants.filter((a) => a.admit_card_status === 'released' || a.admit_card_status === 'approved').length,
        allocated_count: allocatedCount,
        unallocated_count: unallocatedCount,
      },
    })
  } catch (error: any) {
    console.error('Admit cards GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/scholarships/admit-cards
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { action, applicant_ids, scheme_id, center_id } = body

    // ── ACTION 1: AUTO ALLOCATION ENGINE ──────────────────────────────────────
    if (action === 'auto_allocate') {
      // 1. Fetch active exam centers with capacities
      const { data: activeCenters, error: cErr } = await supabaseAdmin
        .from('exam_centers')
        .select('*')
        .eq('status', 'active')

      if (cErr || !activeCenters || activeCenters.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No active exam centers found. Please add or activate at least one exam center in the Centers tab first.',
        }, { status: 400 })
      }

      // 2. Fetch target provisional applicants
      let query = supabaseAdmin
        .from('scholarship_applications')
        .select('*, scholarships(*)')
        .order('created_at', { ascending: true })

      if (scheme_id && scheme_id !== 'all') {
        query = query.eq('scholarship_id', scheme_id)
      }
      if (applicant_ids && applicant_ids.length > 0) {
        query = query.in('id', applicant_ids)
      }

      const { data: targets, error: fetchErr } = await query
      if (fetchErr) {
        return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 })
      }

      if (!targets || targets.length === 0) {
        return NextResponse.json({ success: true, message: 'No applicants found to allocate.', count: 0 })
      }

      // Track capacity dynamically during allocation run
      const centerCapTracker = activeCenters.map((c) => ({
        ...c,
        currentCount: c.allocated_count || 0,
      }))

      let allocatedSuccessCount = 0
      let fallbackAllocatedCount = 0
      const updatePromises: Promise<any>[] = []

      for (const app of targets) {
        const prefState = app.preference_state || app.state || app.documents?.preference_state || app.documents?.state || ''
        const prefDist1 = (app.preference_district_1 || app.district || app.city || app.documents?.preference_district_1 || app.documents?.district || '').toLowerCase().trim()
        const prefDist2 = (app.preference_district_2 || app.documents?.preference_district_2 || '').toLowerCase().trim()
        const resDist = (app.district || app.city || app.documents?.district || app.documents?.city || '').toLowerCase().trim()

        // Match Rule 1: Preference District 1 with capacity
        let matchedCenter = centerCapTracker.find((c) =>
          c.district.toLowerCase().trim() === prefDist1 && c.currentCount < c.max_capacity
        )

        // Match Rule 2: Preference District 2 with capacity
        if (!matchedCenter && prefDist2) {
          matchedCenter = centerCapTracker.find((c) =>
            c.district.toLowerCase().trim() === prefDist2 && c.currentCount < c.max_capacity
          )
        }

        // Match Rule 3: Residence District matching
        if (!matchedCenter && resDist) {
          matchedCenter = centerCapTracker.find((c) =>
            c.district.toLowerCase().trim() === resDist && c.currentCount < c.max_capacity
          )
        }

        // Match Rule 4: Match within same State with capacity
        if (!matchedCenter && prefState) {
          matchedCenter = centerCapTracker.find((c) =>
            c.state.toLowerCase().trim() === prefState.toLowerCase().trim() && c.currentCount < c.max_capacity
          )
        }

        // Match Rule 5: Fallback to any active center with capacity
        if (!matchedCenter) {
          matchedCenter = centerCapTracker.find((c) => c.currentCount < c.max_capacity)
          if (matchedCenter) fallbackAllocatedCount++
        }

        if (matchedCenter) {
          matchedCenter.currentCount += 1
          allocatedSuccessCount += 1

          const rollSuffix = Math.floor(1000 + Math.random() * 9000)
          const centerCodeFormatted = matchedCenter.center_code || 'HUB01'
          const generatedRoll = app.roll_number || `SCH26-${centerCodeFormatted}-${rollSuffix}`
          const scheme = app.scholarships
          const timing = parseCenterTimingFromLandmark(matchedCenter.landmark)
          const examDate = scheme?.exam_date || '2026-09-28'
          const dynamicSlot = `${examDate} | ${timing.exam_start_time} - ${timing.exam_end_time} (Reporting ${timing.reporting_time})`

          updatePromises.push(
            (async () => {
              await supabaseAdmin
                .from('scholarship_applications')
                .update({
                  assigned_center_id: matchedCenter.id,
                  assigned_center_code: matchedCenter.center_code,
                  assigned_center_name: matchedCenter.center_name,
                  assigned_center_address: `${matchedCenter.address}, ${matchedCenter.city}, ${matchedCenter.district}, ${matchedCenter.state} - ${matchedCenter.pincode || ''}`,
                  assigned_center_landmark: timing.clean_landmark,
                  assigned_center_maps_url: matchedCenter.google_maps_url || '',
                  exam_center: `${matchedCenter.center_name} [${matchedCenter.center_code}]`,
                  roll_number: generatedRoll,
                  exam_slot: dynamicSlot,
                  exam_shift: timing.exam_shift,
                  reporting_time: timing.reporting_time,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', app.id)
            })()
          )
        }
      }

      await Promise.all(updatePromises)

      // Sync allocated counts back to exam_centers table
      for (const c of centerCapTracker) {
        await supabaseAdmin
          .from('exam_centers')
          .update({ allocated_count: c.currentCount })
          .eq('id', c.id)
      }

      return NextResponse.json({
        success: true,
        message: `Successfully allocated ${allocatedSuccessCount} candidates to their nearest district exam centers! (${fallbackAllocatedCount} assigned to regional backup centers due to district capacity limits).`,
        allocated_count: allocatedSuccessCount,
        fallback_count: fallbackAllocatedCount,
        total_targets: targets.length,
      })
    }

    // ── ACTION 2: MANUAL BULK ALLOCATE TO SPECIFIC CENTER ─────────────────────
    if (action === 'manual_allocate') {
      if (!center_id) {
        return NextResponse.json({ success: false, error: 'Please select an Exam Center to assign.' }, { status: 400 })
      }
      if (!applicant_ids || applicant_ids.length === 0) {
        return NextResponse.json({ success: false, error: 'No applicants selected for manual allocation.' }, { status: 400 })
      }

      const { data: center, error: cErr } = await supabaseAdmin
        .from('exam_centers')
        .select('*')
        .eq('id', center_id)
        .single()

      if (cErr || !center) {
        return NextResponse.json({ success: false, error: 'Selected exam center not found.' }, { status: 404 })
      }

      const timing = parseCenterTimingFromLandmark(center.landmark)
      const dynamicSlot = `2026-09-28 | ${timing.exam_start_time} - ${timing.exam_end_time} (Reporting ${timing.reporting_time})`

      const updatePromises = applicant_ids.map((appId: string) => {
        const rollSuffix = Math.floor(1000 + Math.random() * 9000)
        return (async () => {
          await supabaseAdmin
            .from('scholarship_applications')
            .update({
              assigned_center_id: center.id,
              assigned_center_code: center.center_code,
              assigned_center_name: center.center_name,
              assigned_center_address: `${center.address}, ${center.city}, ${center.district}, ${center.state} - ${center.pincode || ''}`,
              assigned_center_landmark: timing.clean_landmark,
              assigned_center_maps_url: center.google_maps_url || '',
              exam_center: `${center.center_name} [${center.center_code}]`,
              roll_number: `SCH26-${center.center_code}-${rollSuffix}`,
              exam_slot: dynamicSlot,
              exam_shift: timing.exam_shift,
              reporting_time: timing.reporting_time,
              updated_at: new Date().toISOString(),
            })
            .eq('id', appId)
        })()
      })

      await Promise.all(updatePromises)

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${applicant_ids.length} candidates to "${center.center_name}" (${center.center_code})!`,
      })
    }

    // ── ACTION 3: PUBLISH ADMIT CARDS (BULK OFFICIAL RELEASE) ──────────────────
    if (action === 'bulk_approve' || action === 'publish_admit_cards') {
      let query = supabaseAdmin
        .from('scholarship_applications')
        .select('*, scholarships(*)')
        .eq('admit_card_status', 'provisional')

      if (scheme_id && scheme_id !== 'all') {
        query = query.eq('scholarship_id', scheme_id)
      }
      if (applicant_ids && applicant_ids.length > 0) {
        query = query.in('id', applicant_ids)
      }

      const { data: targets, error: fetchErr } = await query
      if (fetchErr) {
        return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 })
      }

      if (!targets || targets.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No provisional applicants found to publish admit cards for.',
          count: 0,
        })
      }

      // Filter unapproved school partner candidates
      const eligibleTargets = targets.filter((app) => {
        const isSchoolPartner = app.school_id || app.registration_source === 'SCHOOL'
        if (isSchoolPartner) {
          const approvalStatus = app.documents?.school_approval_status
          return approvalStatus === 'APPROVED'
        }
        return true
      })

      const skippedCount = targets.length - eligibleTargets.length

      if (eligibleTargets.length === 0) {
        return NextResponse.json({
          success: false,
          error: `All ${skippedCount} candidate(s) are registered under School Tie-ups and have not been verified/approved by their school authorities yet.`,
        }, { status: 400 })
      }

      const updatePromises = eligibleTargets.map((app) => {
        const rollSuffix = Math.floor(1000 + Math.random() * 9000)
        const scheme = app.scholarships
        const centerName = app.assigned_center_name || app.exam_center || scheme?.exam_venue || 'National Proctored Online Assessment Hub'
        const centerAddr = app.assigned_center_address || scheme?.exam_venue || 'Designated National Assessment Facility'

        return (async () => {
          await supabaseAdmin
            .from('scholarship_applications')
            .update({
              admit_card_status: 'released',
              roll_number: app.roll_number || `SCH26-${app.assigned_center_code || 'HUB'}-${rollSuffix}`,
              exam_center: centerName,
              assigned_center_name: centerName,
              assigned_center_address: centerAddr,
              exam_slot: app.exam_slot || `${scheme?.exam_date || '2026-09-20'} | ${scheme?.exam_time || '10:00 AM - 12:30 PM'} (Reporting 09:15 AM)`,
              admit_card_issued_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', app.id)
        })()
      })

      await Promise.all(updatePromises)

      // Send admit card announcement emails to all eligible candidates asynchronously
      const emailPromises = eligibleTargets
        .filter((app) => app.applicant_email)
        .map((app) =>
          sendAnnouncementEmail({
            to: app.applicant_email,
            applicant_name: app.applicant_name || 'Candidate',
            type: 'ADMIT_CARD',
            title: app.scholarship_title || (app.scholarships?.title) || 'Scholarship Examination',
          }).catch((e) => console.error(`Email failed for ${app.applicant_email}:`, e))
        )
      Promise.all(emailPromises).catch(console.error)

      return NextResponse.json({
        success: true,
        message: skippedCount > 0
          ? `Successfully published ${eligibleTargets.length} Official Admit Cards! (${skippedCount} student(s) skipped due to pending school approval).`
          : `🎉 Successfully published ${eligibleTargets.length} Official Hall Tickets with allotted examination centers and roll numbers!`,
        count: eligibleTargets.length,
        skipped_count: skippedCount,
      })
    }

    // ── ACTION 4: SINGLE CANDIDATE RELEASE ────────────────────────────────────
    if (action === 'single_approve') {
      const { applicant_id, roll_number, exam_center, assigned_center_address, exam_slot } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const { data: target, error: targetErr } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*, scholarships(*)')
        .eq('id', applicant_id)
        .single()

      if (targetErr || !target) {
        return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
      }

      const isSchoolPartner = target.school_id || target.registration_source === 'SCHOOL'
      if (isSchoolPartner && target.documents?.school_approval_status !== 'APPROVED') {
        return NextResponse.json({
          success: false,
          error: `Admit card cannot be released: Candidate is registered under school "${target.school_name || target.school_id}" and has not been verified/approved by the school yet.`,
        }, { status: 400 })
      }

      const scheme = target.scholarships
      const rollSuffix = Math.floor(1000 + Math.random() * 9000)

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          admit_card_status: 'released',
          roll_number: roll_number || target.roll_number || `SCH26-${target.assigned_center_code || 'ALLOT'}-${rollSuffix}`,
          exam_center: exam_center || target.assigned_center_name || target.exam_center || scheme?.exam_venue || 'National Proctored Online Portal',
          assigned_center_name: exam_center || target.assigned_center_name || target.exam_center || scheme?.exam_venue || 'National Proctored Online Portal',
          assigned_center_address: assigned_center_address || target.assigned_center_address || scheme?.exam_venue || 'Designated Regional Center',
          exam_slot: exam_slot || target.exam_slot || `${scheme?.exam_date || '2026-09-20'} | ${scheme?.exam_time || '10:00 AM - 12:30 PM'} (Reporting 09:15 AM)`,
          admit_card_issued_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)
        .select()
        .single()

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Official Hall Ticket released successfully!', data: updated })
    }

    // ── ACTION 5: REVOKE TO PROVISIONAL ───────────────────────────────────────
    if (action === 'revoke') {
      const { applicant_id } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const { error: revokeErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          admit_card_status: 'provisional',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (revokeErr) {
        return NextResponse.json({ success: false, error: revokeErr.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Admit Card reverted to provisional status' })
    }

    // ── ACTION 6: DELETE CANDIDATE APPLICATION ──────────────────────────────
    if (action === 'delete') {
      const { applicant_id } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const { data: appData } = await supabaseAdmin
        .from('scholarship_applications')
        .select('id, application_no, applicant_name, assigned_center_id')
        .eq('id', applicant_id)
        .maybeSingle()

      const { error: delErr } = await supabaseAdmin
        .from('scholarship_applications')
        .delete()
        .eq('id', applicant_id)

      if (delErr) {
        return NextResponse.json({ success: false, error: delErr.message }, { status: 500 })
      }

      if (appData?.assigned_center_id) {
        try {
          const { data: center } = await supabaseAdmin
            .from('exam_centers')
            .select('allocated_count')
            .eq('id', appData.assigned_center_id)
            .single()
          if (center && (center.allocated_count || 0) > 0) {
            await supabaseAdmin
              .from('exam_centers')
              .update({ allocated_count: Math.max(0, (center.allocated_count || 1) - 1) })
              .eq('id', appData.assigned_center_id)
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, message: `Candidate ${appData?.applicant_name || ''} deleted successfully.` })
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 })
  } catch (error: any) {
    console.error('Admit card approve exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/scholarships/admit-cards
export async function DELETE(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    let applicantId = searchParams.get('id')

    if (!applicantId) {
      try {
        const body = await request.json()
        applicantId = body.applicant_id || body.id
      } catch (e) {}
    }

    if (!applicantId) {
      return NextResponse.json({ success: false, error: 'Candidate Application ID is required to delete.' }, { status: 400 })
    }

    // 1. Fetch applicant details
    let targetAppId = applicantId
    const { data: appData } = await supabaseAdmin
      .from('scholarship_applications')
      .select('id, application_no, applicant_name, assigned_center_id')
      .eq('id', applicantId)
      .maybeSingle()

    if (!appData) {
      const { data: appByNo } = await supabaseAdmin
        .from('scholarship_applications')
        .select('id, application_no, applicant_name, assigned_center_id')
        .eq('application_no', applicantId)
        .maybeSingle()
      if (appByNo) {
        targetAppId = appByNo.id
      }
    }

    // 2. Delete candidate record
    const { error: deleteErr } = await supabaseAdmin
      .from('scholarship_applications')
      .delete()
      .eq('id', targetAppId)

    if (deleteErr) {
      console.error('Error deleting candidate application:', deleteErr)
      return NextResponse.json({ success: false, error: deleteErr.message }, { status: 500 })
    }

    // 3. Decrement center count if was assigned
    if (appData?.assigned_center_id) {
      try {
        const { data: center } = await supabaseAdmin
          .from('exam_centers')
          .select('allocated_count')
          .eq('id', appData.assigned_center_id)
          .single()
        if (center && (center.allocated_count || 0) > 0) {
          await supabaseAdmin
            .from('exam_centers')
            .update({ allocated_count: Math.max(0, (center.allocated_count || 1) - 1) })
            .eq('id', appData.assigned_center_id)
        }
      } catch (err) {
        console.warn('Could not decrement center count:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Candidate application ${appData?.application_no ? `(${appData.application_no})` : ''} deleted successfully.`,
    })
  } catch (error: any) {
    console.error('Admit card DELETE exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
