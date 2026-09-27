import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess } from '@/lib/superadmin-auth'

export const dynamic = 'force-dynamic'

// PATCH /api/superadmin/scholarships/applications
export async function PATCH(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 })
    }

    // Verify application exists
    const { data: existingApp, error: fetchErr } = await supabaseAdmin
      .from('scholarship_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existingApp) {
      return NextResponse.json({ success: false, error: 'Application record not found' }, { status: 404 })
    }

    // Build update payload
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.applicant_name !== undefined) updatePayload.applicant_name = updates.applicant_name.trim()
    if (updates.father_name !== undefined) updatePayload.father_name = updates.father_name.trim()
    if (updates.mother_name !== undefined) updatePayload.mother_name = updates.mother_name.trim()
    if (updates.applicant_phone !== undefined) updatePayload.applicant_phone = updates.applicant_phone.trim()
    if (updates.applicant_email !== undefined) updatePayload.applicant_email = updates.applicant_email.trim().toLowerCase()
    if (updates.dob !== undefined) updatePayload.dob = updates.dob
    if (updates.gender !== undefined) updatePayload.gender = updates.gender
    if (updates.category !== undefined) updatePayload.category = updates.category
    if (updates.qualification !== undefined) updatePayload.qualification = updates.qualification.trim()
    if (updates.school_class !== undefined) updatePayload.school_class = updates.school_class.trim()
    if (updates.school_name !== undefined) {
      updatePayload.school_name = updates.school_name.trim()
      updatePayload.school_college_name = updates.school_name.trim()
    } else if (updates.school_college_name !== undefined) {
      updatePayload.school_name = updates.school_college_name.trim()
      updatePayload.school_college_name = updates.school_college_name.trim()
    }
    if (updates.school_roll_number !== undefined) updatePayload.school_roll_number = updates.school_roll_number.trim()
    if (updates.school_section !== undefined) updatePayload.school_section = updates.school_section.trim()
    if (updates.percentage !== undefined) updatePayload.percentage = Number(updates.percentage) || 0
    if (updates.annual_family_income !== undefined) updatePayload.annual_family_income = Number(updates.annual_family_income) || 0
    if (updates.address !== undefined) updatePayload.address = updates.address.trim()
    if (updates.city !== undefined) updatePayload.city = updates.city.trim()
    if (updates.district !== undefined) updatePayload.district = updates.district.trim()
    if (updates.state !== undefined) updatePayload.state = updates.state.trim()
    if (updates.pincode !== undefined) updatePayload.pincode = updates.pincode.trim()
    if (updates.preference_state !== undefined) updatePayload.preference_state = updates.preference_state.trim()
    if (updates.preference_district_1 !== undefined) updatePayload.preference_district_1 = updates.preference_district_1.trim()
    if (updates.preference_district_2 !== undefined) updatePayload.preference_district_2 = updates.preference_district_2.trim()
    if (updates.exam_city_preference !== undefined) {
      updatePayload.exam_city_preference = updates.exam_city_preference.trim()
    } else if (updates.preference_district_1 || updates.preference_district_2) {
      const pref1 = updates.preference_district_1 || existingApp.preference_district_1 || 'Patna'
      const pref2 = updates.preference_district_2 || existingApp.preference_district_2 || 'Gaya'
      updatePayload.exam_city_preference = `${pref1} (Pref 1) / ${pref2} (Pref 2)`
    }

    // Merge updated fields into documents JSONB for synchronization
    const existingDocs = (typeof existingApp.documents === 'object' && existingApp.documents) ? existingApp.documents : {}
    updatePayload.documents = {
      ...existingDocs,
      school_name: updatePayload.school_name || existingDocs.school_name || null,
      school_class: updatePayload.school_class || updatePayload.qualification || existingDocs.school_class || null,
      school_roll_no: updatePayload.school_roll_number || existingDocs.school_roll_no || null,
      school_admission_no: updates.school_admission_no !== undefined ? updates.school_admission_no.trim() : (updates.admission_no !== undefined ? updates.admission_no.trim() : existingDocs.school_admission_no),
      admission_no: updates.admission_no !== undefined ? updates.admission_no.trim() : (updates.school_admission_no !== undefined ? updates.school_admission_no.trim() : existingDocs.admission_no),
      school_section: updatePayload.school_section || existingDocs.school_section || null,
      preference_state: updatePayload.preference_state || existingDocs.preference_state || null,
      preference_district_1: updatePayload.preference_district_1 || existingDocs.preference_district_1 || null,
      preference_district_2: updatePayload.preference_district_2 || existingDocs.preference_district_2 || null,
      district: updatePayload.district || existingDocs.district || null,
      state: updatePayload.state || existingDocs.state || null,
      last_edited_by: 'superadmin',
      last_edited_at: new Date().toISOString(),
    }

    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from('scholarship_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      console.error('Superadmin update scholarship application error:', updateErr)
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Applicant details updated successfully.',
      data: updatedApp,
    })
  } catch (error: any) {
    console.error('Superadmin scholarship application PATCH exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
