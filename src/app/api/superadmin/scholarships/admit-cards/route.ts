import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

// GET /api/superadmin/scholarships/admit-cards
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
      console.error('Error fetching applicants:', applicantsRes.error)
      return NextResponse.json({ success: false, error: applicantsRes.error.message }, { status: 500 })
    }

    const applicants = applicantsRes.data || []
    const schemes = schemesRes.data || []

    return NextResponse.json({
      success: true,
      applicants,
      schemes,
      stats: {
        total_applicants: applicants.length,
        provisional: applicants.filter((a) => a.admit_card_status === 'provisional').length,
        released: applicants.filter((a) => a.admit_card_status === 'released' || a.admit_card_status === 'approved').length,
      },
    })
  } catch (error: any) {
    console.error('Admit cards GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/scholarships/admit-cards (Bulk or Single Approve)
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { action, applicant_ids, scheme_id, default_center } = body

    if (action === 'bulk_approve') {
      // 1. Fetch relevant provisional applications
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
          message: 'No provisional applicants found matching the criteria.',
          count: 0,
        })
      }

      // Filter out school partner candidates who are NOT approved by their school
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
          error: skippedCount > 0
            ? `All ${skippedCount} selected candidates are enrolled under School Tie-ups and have NOT been approved by their respective schools yet. Admit cards cannot be released until school authorities verify and approve them.`
            : 'No eligible provisional candidates found.',
          count: 0,
        })
      }

      // Update each eligible target application
      const updatePromises = eligibleTargets.map((app) => {
        const rollSuffix = Math.floor(1000 + Math.random() * 9000)
        const scheme = app.scholarships
        return supabaseAdmin
          .from('scholarship_applications')
          .update({
            admit_card_status: 'released',
            roll_number: app.roll_number || `AAGAJ-26-${rollSuffix}`,
            exam_center: default_center || app.exam_center || app.exam_city_preference || scheme?.exam_venue || 'National Proctored Online Portal',
            exam_slot: `${scheme?.exam_date || '2026-09-20'} | ${scheme?.exam_time || '10:00 AM - 12:30 PM'} (Reporting 09:15 AM)`,
            admit_card_issued_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', app.id)
      })

      await Promise.all(updatePromises)

      // Fetch fresh list
      const { data: updatedApplicants } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .order('created_at', { ascending: false })

      return NextResponse.json({
        success: true,
        message: skippedCount > 0
          ? `Successfully released ${eligibleTargets.length} Admit Cards! (${skippedCount} school student(s) were skipped because their school has not verified/approved them yet).`
          : `Successfully bulk-approved and released ${eligibleTargets.length} Official Admit Cards!`,
        count: eligibleTargets.length,
        skipped_school_unapproved: skippedCount,
        updated_applicants: updatedApplicants || [],
      })
    } else if (action === 'single_approve') {
      const { applicant_id, roll_number, exam_center, exam_slot } = body
      if (!applicant_id) return NextResponse.json({ success: false, error: 'Applicant ID required' }, { status: 400 })

      const { data: target, error: targetErr } = await supabaseAdmin
        .from('scholarship_applications')
        .select('*, scholarships(*)')
        .eq('id', applicant_id)
        .single()

      if (targetErr || !target) {
        return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 })
      }

      // Enforce school verification guard for single approval
      const isSchoolPartner = target.school_id || target.registration_source === 'SCHOOL'
      if (isSchoolPartner && target.documents?.school_approval_status !== 'APPROVED') {
        return NextResponse.json({
          success: false,
          error: `Admit card cannot be released: Candidate is registered under school "${target.school_name || target.school_id}" and has not been verified/approved by the school yet (Current status: ${target.documents?.school_approval_status || 'PENDING'}).`,
        }, { status: 400 })
      }

      const scheme = target.scholarships
      const rollSuffix = Math.floor(1000 + Math.random() * 9000)

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('scholarship_applications')
        .update({
          admit_card_status: 'released',
          roll_number: roll_number || target.roll_number || `AAGAJ-26-${rollSuffix}`,
          exam_center: exam_center || target.exam_center || target.exam_city_preference || scheme?.exam_venue || 'National Proctored Online Portal',
          exam_slot: exam_slot || `${scheme?.exam_date || '2026-09-20'} | ${scheme?.exam_time || '10:00 AM - 12:30 PM'} (Reporting 09:15 AM)`,
          admit_card_issued_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)
        .select()
        .single()

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Admit Card approved and released successfully!',
        data: updated,
      })
    } else if (action === 'revoke') {
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

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 })
  } catch (error: any) {
    console.error('Admit card approve exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
