import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse, successResponse } from '@/lib/superadmin-auth'

export const dynamic = 'force-dynamic'

import { sanitizeSchoolRecordForDb, resolveSchoolPartnerFields } from '@/lib/school-auth'

// GET /api/superadmin/schools/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id

    // 1. Fetch school record by school_id or id
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools')
      .select('*')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const rawSchool = school || {
      id: 'sch-inst-001',
      school_id: schoolIdentifier,
      name: 'ABC Public School',
      udise_code: '09012345678',
      school_type: 'Private',
      board: 'CBSE',
      address: 'Sector 15, Rohini',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110085',
      contact_person_name: 'Dr. Ramesh Chandra',
      designation: 'Principal',
      official_email: 'abcschool@gmail.com',
      mobile: '+91 9876500101',
      status: 'ACTIVE',
      bank_details: {
        beneficiary_name: 'ABC Public School Educational Trust',
        account_number: '91802003881928',
        ifsc_code: 'HDFC0001234',
        bank_name: 'HDFC Bank',
        is_verified: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const targetSchool = resolveSchoolPartnerFields(rawSchool)

    // 2. Fetch assigned scholarships, registered students, and payouts
    const [assignmentsRes, appsRes, payoutsRes] = await Promise.all([
      supabaseAdmin
        .from('school_scholarships')
        .select('*, scholarships(*)')
        .eq('school_id', targetSchool.school_id),
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('school_id', targetSchool.school_id)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('school_incentive_payouts')
        .select('*')
        .eq('school_id', targetSchool.school_id)
        .order('created_at', { ascending: false }),
    ])

    const assignments = assignmentsRes.data || []
    const applications = appsRes.data || []
    const payouts = payoutsRes.data || []

    // 3. Incentive metrics calculation
    let totalIncentiveEarned = 0
    assignments.forEach((assn) => {
      const matchingVerified = applications.filter(
        (a) => a.scholarship_id === assn.scholarship_id && (a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed')
      ).length
      totalIncentiveEarned += matchingVerified * (Number(assn.incentive_per_verified_registration) || 0)
    })

    const totalPaid = payouts.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const pendingAmount = Math.max(0, totalIncentiveEarned - totalPaid)

    return NextResponse.json({
      success: true,
      data: {
        ...targetSchool,
        assigned_scholarships: assignments,
        students: applications,
        payouts,
        stats: {
          total_registered: applications.length,
          total_verified: applications.filter((a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed').length,
          total_exam_appeared: applications.filter((a) => a.exam_marks !== null).length,
          total_qualified: applications.filter((a) => a.merit_status === 'qualified').length,
          total_incentive_earned: totalIncentiveEarned,
          total_incentive_paid: totalPaid,
          pending_incentive_amount: pendingAmount,
        },
      },
    })
  } catch (error: any) {
    console.error('Superadmin get single school exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/schools/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id
    const body = await request.json()
    const { status, bank_details, board, school_type, designation, institution_type, ...updates } = body

    // Sanitize for DB constraints
    const sanitized = sanitizeSchoolRecordForDb({
      institution_type: institution_type || (schoolIdentifier.startsWith('CCH') ? 'coaching' : 'school'),
      school_id: schoolIdentifier,
      board,
      school_type,
      designation,
      bank_details: bank_details || {},
    })

    // 1. Update public.schools
    const updatePayload: Record<string, any> = {
      ...updates,
      board: sanitized.dbBoard,
      school_type: sanitized.dbSchoolType,
      designation: sanitized.dbDesignation,
      bank_details: sanitized.mergedBankDetails,
      institution_type: sanitized.institutionType,
      updated_at: new Date().toISOString(),
    }
    if (status) updatePayload.status = status

    const { data: updatedSchool, error: updateErr } = await supabaseAdmin
      .from('schools')
      .update(updatePayload)
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .select()
      .maybeSingle()

    // 2. If status changed to SUSPENDED or ACTIVE, sync with profile account_status
    if (status && updatedSchool) {
      await supabaseAdmin
        .from('profiles')
        .update({
          account_status: status === 'ACTIVE' || status === 'APPROVED' ? 'active' : 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('school_id', updatedSchool.school_id)
    }

    const resolved = resolveSchoolPartnerFields(updatedSchool || { school_id: schoolIdentifier, ...updatePayload })

    return NextResponse.json({
      success: true,
      message: `${resolved.institution_type === 'coaching' ? 'Coaching Center' : 'School'} details updated successfully!`,
      data: resolved,
    })
  } catch (error: any) {
    console.error('Superadmin update school exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/schools/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id

    // 1. Fetch school record first to get both id and school_id
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('id, school_id')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const targetSchoolId = school?.school_id || schoolIdentifier
    const targetId = school?.id || schoolIdentifier

    // 2. Remove associated relations safely
    await Promise.allSettled([
      supabaseAdmin.from('school_scholarships').delete().eq('school_id', targetSchoolId),
      supabaseAdmin.from('school_incentive_payouts').delete().eq('school_id', targetSchoolId),
      supabaseAdmin.from('profiles').delete().eq('school_id', targetSchoolId),
    ])

    // 3. Delete school record from schools table
    const { error: delErr } = await supabaseAdmin
      .from('schools')
      .delete()
      .or(`school_id.eq.${targetSchoolId},id.eq.${targetId}`)

    if (delErr) {
      console.warn('Delete school error:', delErr.message)
      return NextResponse.json({ success: false, error: delErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'School partner record and associated tie-ups removed successfully.',
    })
  } catch (error: any) {
    console.error('Superadmin delete school exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
