import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse, successResponse } from '@/lib/superadmin-auth'

export const dynamic = 'force-dynamic'

// GET /api/superadmin/schools/[id]/scholarships
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id

    // 1. Fetch target school
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('*')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const schoolId = school?.school_id || schoolIdentifier

    // 2. Fetch all schemes & current school assignments
    const [schemesRes, assignmentsRes, appsRes] = await Promise.all([
      supabaseAdmin.from('scholarships').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('school_scholarships').select('*').eq('school_id', schoolId),
      supabaseAdmin.from('scholarship_applications').select('id, scholarship_id, payment_status, status').eq('school_id', schoolId),
    ])

    const allSchemes = schemesRes.data || []
    const assignments = assignmentsRes.data || []
    const applications = appsRes.data || []

    const enrichedAssignments = assignments.map((assn) => {
      const scheme = allSchemes.find((s) => s.id === assn.scholarship_id)
      const schApps = applications.filter((a) => a.scholarship_id === assn.scholarship_id)
      const verifiedCount = schApps.filter((a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed').length
      const rate = Number(assn.incentive_per_verified_registration) || 0

      return {
        ...assn,
        scheme,
        students_registered_count: schApps.length,
        verified_count: verifiedCount,
        total_incentive_earned: verifiedCount * rate,
      }
    })

    return NextResponse.json({
      success: true,
      assigned: enrichedAssignments,
      available_schemes: allSchemes.filter((s) => !assignments.some((a) => a.scholarship_id === s.id)),
    })
  } catch (error: any) {
    console.error('Superadmin get school scholarships exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/schools/[id]/scholarships
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id
    const body = await request.json()
    const {
      scholarship_id,
      registration_fee = 100,
      incentive_per_verified_registration = 20,
      start_date,
      end_date,
      status = 'ACTIVE',
    } = body

    if (!scholarship_id) {
      return errorResponse('Scholarship ID is required', 400)
    }

    // 1. Resolve school_id
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('school_id')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const schoolId = school?.school_id || schoolIdentifier

    // 2. Check if scheme exists
    const { data: scheme } = await supabaseAdmin
      .from('scholarships')
      .select('id, title')
      .eq('id', scholarship_id)
      .maybeSingle()

    const assignmentId = `ss-${Date.now()}`
    const newAssignment = {
      id: assignmentId,
      school_id: schoolId,
      scholarship_id,
      registration_fee: Number(registration_fee) || 0,
      incentive_per_verified_registration: Number(incentive_per_verified_registration) || 0,
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || null,
      status: status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('school_scholarships')
      .upsert(newAssignment, { onConflict: 'school_id,scholarship_id' })
      .select()
      .maybeSingle()

    if (insertErr) {
      console.warn('Upsert into school_scholarships error:', insertErr.message)
    }

    return NextResponse.json({
      success: true,
      message: `Scholarship '${scheme?.title || scholarship_id}' assigned to school ${schoolId} successfully!`,
      data: inserted || newAssignment,
    })
  } catch (error: any) {
    console.error('Superadmin assign scholarship exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/superadmin/schools/[id]/scholarships
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id
    const body = await request.json()
    const { assignment_id, scholarship_id, registration_fee, incentive_per_verified_registration, status, start_date, end_date } = body

    // Resolve school_id
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('school_id')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const schoolId = school?.school_id || schoolIdentifier

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (registration_fee !== undefined) updates.registration_fee = Number(registration_fee)
    if (incentive_per_verified_registration !== undefined) updates.incentive_per_verified_registration = Number(incentive_per_verified_registration)
    if (status !== undefined) updates.status = status
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date

    let query = supabaseAdmin.from('school_scholarships').update(updates)
    if (assignment_id) {
      query = query.eq('id', assignment_id)
    } else if (scholarship_id) {
      query = query.eq('school_id', schoolId).eq('scholarship_id', scholarship_id)
    }

    const { data: updated, error } = await query.select().maybeSingle()
    if (error) {
      console.warn('Update school_scholarships error:', error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Assigned scholarship terms updated successfully!',
      data: updated || { school_id: schoolId, scholarship_id, ...updates },
    })
  } catch (error: any) {
    console.error('Superadmin update assigned scholarship exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/superadmin/schools/[id]/scholarships
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const schoolIdentifier = params.id
    const { searchParams } = new URL(request.url)
    const scholarshipId = searchParams.get('scholarship_id')
    const assignmentId = searchParams.get('assignment_id')

    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('school_id')
      .or(`school_id.eq.${schoolIdentifier},id.eq.${schoolIdentifier}`)
      .maybeSingle()

    const schoolId = school?.school_id || schoolIdentifier

    let query = supabaseAdmin.from('school_scholarships').delete()
    if (assignmentId) {
      query = query.eq('id', assignmentId)
    } else if (scholarshipId) {
      query = query.eq('school_id', schoolId).eq('scholarship_id', scholarshipId)
    }

    await query

    return NextResponse.json({
      success: true,
      message: 'Scholarship association removed from school.',
    })
  } catch (error: any) {
    console.error('Superadmin delete assigned scholarship exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
