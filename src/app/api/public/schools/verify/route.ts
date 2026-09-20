import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/public/schools/verify?school_id=SCH000105&scholarship_id=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolIdRaw = searchParams.get('school_id')?.trim()
    const scholarshipId = searchParams.get('scholarship_id')?.trim()

    if (!schoolIdRaw) {
      return NextResponse.json(
        { success: false, error: 'School ID is required for partner verification.' },
        { status: 400 }
      )
    }

    const cleanSchoolId = schoolIdRaw.toUpperCase()

    // 1. Fetch School from Supabase
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools')
      .select('*')
      .or(`school_id.eq.${cleanSchoolId},school_id.ilike.${cleanSchoolId},id.eq.${cleanSchoolId}`)
      .maybeSingle()

    if (schoolErr) {
      console.warn('School lookup error:', schoolErr.message)
    }

    if (!school) {
      return NextResponse.json({
        success: false,
        error: `School ID "${cleanSchoolId}" not found in National Partner Registry. Please check the ID provided by your school administration.`,
      }, { status: 404 })
    }

    // 2. Check if School is ACTIVE
    if (school.status === 'SUSPENDED') {
      return NextResponse.json({
        success: false,
        error: `School Partner "${school.name}" (${school.school_id}) is currently SUSPENDED. Please contact your school principal or administration.`,
      }, { status: 403 })
    }

    if (school.status === 'PENDING' || school.status === 'REJECTED') {
      return NextResponse.json({
        success: false,
        error: `School Partner "${school.name}" is pending approval. Direct registration is active.`,
      }, { status: 400 })
    }

    // 3. If scholarship_id provided, verify if this school has tie-up for this scheme
    let isSchemeAssociated = true
    let tieUpDetails = null

    if (scholarshipId) {
      const { data: tieUp } = await supabaseAdmin
        .from('school_scholarships')
        .select('*')
        .eq('school_id', school.school_id)
        .eq('scholarship_id', scholarshipId)
        .maybeSingle()

      if (tieUp) {
        tieUpDetails = tieUp
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      school: {
        id: school.id,
        school_id: school.school_id,
        name: school.name,
        board: school.board,
        school_type: school.school_type,
        city: school.city,
        state: school.state,
        pincode: school.pincode,
        udise_code: school.udise_code,
        contact_person_name: school.contact_person_name,
        designation: school.designation,
        status: school.status,
      },
      tie_up: tieUpDetails,
      message: `Verified: ${school.name} (${school.school_id}) is an official active partner institution.`,
    })
  } catch (error: any) {
    console.error('Verify school exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
