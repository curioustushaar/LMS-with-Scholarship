import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function generateAppNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `SCH-2026-${randomSuffix}`
}

function generateRegistrationCode(): string {
  const randomCode = Math.floor(1000 + Math.random() * 9000)
  return `REG-CODE-${randomCode}`
}

// POST /api/public/scholarships/apply
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      scholarship_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      qualification,
      percentage,
      annual_family_income,
      category,
      father_name,
      mother_name,
      gender,
      dob,
      address,
      state,
      district,
      city,
      pincode,
      preference_state,
      preference_district_1,
      preference_district_2,
      exam_city_preference,
      school_college_name,
      passing_year,
      photo_url,
      signature_url,
      aadhaar_url,
      marksheet_url,
      college_id_url,
      academic_records,
      documents,
      payment_reference,
      payment_amount,
      application_type,
      school_id: inputSchoolId,
      school_name: inputSchoolName,
      school_roll_no,
      school_admission_no,
      school_class,
      school_section,
    } = body

    if (!scholarship_id || !applicant_name?.trim() || !applicant_email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Scholarship ID, full name, and email are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = applicant_email.trim().toLowerCase()

    // 0. Duplicate Registration Check
    const { data: existingApp } = await supabaseAdmin
      .from('scholarship_applications')
      .select('id, application_no, registration_code, registration_source, school_name')
      .eq('scholarship_id', scholarship_id)
      .eq('applicant_email', cleanEmail)
      .maybeSingle()

    if (existingApp) {
      return NextResponse.json({
        success: false,
        error: `Candidate is already registered for this scholarship with Application No: ${existingApp.application_no}. Duplicate registrations are not allowed.`,
        existing_application_no: existingApp.application_no,
        registration_code: existingApp.registration_code,
      }, { status: 409 })
    }

    // 1. Fetch target scholarship scheme details from Supabase
    const { data: targetScheme, error: schemeErr } = await supabaseAdmin
      .from('scholarships')
      .select('*')
      .eq('id', scholarship_id)
      .single()

    if (schemeErr || !targetScheme) {
      return NextResponse.json({ success: false, error: 'Selected scholarship scheme not found.' }, { status: 404 })
    }

    const schemeTitle = targetScheme.title || 'National Scholarship Program'
    const feeAmount = targetScheme.application_fee || 0
    const paymentStatus = feeAmount === 0 ? 'free' : (payment_reference ? 'paid' : 'paid')
    const finalPaymentRef = payment_reference || (feeAmount > 0 ? `PAY_TXN_${Date.now().toString().slice(-8)}` : 'FREE_TIER')

    const applicationNo = generateAppNumber()
    const regCode = generateRegistrationCode()
    const applicantId = `app-${Date.now()}`

    const selectedPrefState = preference_state || state || 'Bihar'
    const selectedPrefDist1 = preference_district_1 || district || city || 'Patna'
    const selectedPrefDist2 = preference_district_2 || 'Gaya'

    const newApplicant = {
      id: applicantId,
      application_no: applicationNo,
      registration_code: regCode,
      scholarship_id: scholarship_id,
      scholarship_title: schemeTitle,
      applicant_name: applicant_name.trim(),
      applicant_email: applicant_email.trim().toLowerCase(),
      applicant_phone: applicant_phone?.trim() || '',
      qualification: qualification?.trim() || '12th (PCM)',
      percentage: percentage ? parseFloat(percentage) : 80.0,
      annual_family_income: annual_family_income ? parseFloat(annual_family_income) : 5.0,
      category: category || 'General',
      father_name: father_name?.trim() || 'Guardian',
      mother_name: mother_name?.trim() || '',
      gender: gender || 'Not Specified',
      dob: dob || '2006-05-15',
      address: address?.trim() || '',
      state: state?.trim() || selectedPrefState,
      district: district?.trim() || selectedPrefDist1,
      city: city?.trim() || selectedPrefDist1,
      pincode: pincode?.trim() || '',
      preference_state: selectedPrefState,
      preference_district_1: selectedPrefDist1,
      preference_district_2: selectedPrefDist2,
      exam_city_preference: `${selectedPrefDist1} (Pref 1) / ${selectedPrefDist2} (Pref 2)`,
      school_college_name: inputSchoolName?.trim() || school_college_name?.trim() || '',
      school_name: inputSchoolName?.trim() || school_college_name?.trim() || '',
      school_roll_number: school_roll_no?.trim() || '',
      school_class: school_class?.trim() || qualification || '',
      school_section: school_section?.trim() || '',
      passing_year: passing_year?.trim() || '2026',
      photo_url: photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      signature_url: signature_url || '',
      aadhaar_url: aadhaar_url || '',
      marksheet_url: marksheet_url || '',
      college_id_url: college_id_url || '',
      documents: documents || {
        aadhaar_uploaded: !!aadhaar_url,
        marksheet_uploaded: !!marksheet_url,
        college_id_uploaded: !!college_id_url,
        photo_uploaded: !!photo_url,
        signature_uploaded: !!signature_url,
        academic_records: academic_records || [],
        school_id: inputSchoolId || null,
        school_name: inputSchoolName || null,
        school_roll_no: school_roll_no || null,
        school_admission_no: school_admission_no || null,
        school_class: school_class || null,
        school_section: school_section || null,
        school_approval_status: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? 'PENDING' : 'NOT_APPLICABLE',
      },
      status: 'confirmed',
      registration_source: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? 'SCHOOL' : 'DIRECT',
      school_id: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? inputSchoolId : null,
      payment_status: paymentStatus,
      payment_reference: finalPaymentRef,
      payment_amount: feeAmount,
      admit_card_status: 'provisional',
      document_status: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? 'pending_school_verification' : 'pending',
      award_status: 'none',
      merit_status: 'waiting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 2. Insert into Supabase database
    let insertedData: any = null
    const { data: firstTry, error: insertErr } = await supabaseAdmin
      .from('scholarship_applications')
      .insert(newApplicant)
      .select()
      .single()

    if (insertErr) {
      console.warn('Initial insert notice (possible missing column in DB schema):', insertErr.message)
      
      // Fallback: If DB schema doesn't have district/preference columns yet, embed them into documents JSONB and retry
      const safeDocuments = {
        ...(newApplicant.documents || {}),
        district: newApplicant.district,
        state: newApplicant.state,
        city: newApplicant.city,
        pincode: newApplicant.pincode,
        preference_state: newApplicant.preference_state,
        preference_district_1: newApplicant.preference_district_1,
        preference_district_2: newApplicant.preference_district_2,
      }

      const fallbackApplicant: any = { ...newApplicant }
      delete fallbackApplicant.district
      delete fallbackApplicant.preference_state
      delete fallbackApplicant.preference_district_1
      delete fallbackApplicant.preference_district_2
      delete fallbackApplicant.assigned_center_id
      delete fallbackApplicant.assigned_center_code
      delete fallbackApplicant.assigned_center_name
      delete fallbackApplicant.assigned_center_address
      delete fallbackApplicant.assigned_center_landmark
      delete fallbackApplicant.assigned_center_maps_url
      delete fallbackApplicant.exam_shift
      delete fallbackApplicant.reporting_time
      fallbackApplicant.documents = safeDocuments

      const { data: retryData, error: retryErr } = await supabaseAdmin
        .from('scholarship_applications')
        .insert(fallbackApplicant)
        .select()
        .single()

      if (retryErr) {
        console.error('Error inserting scholarship application retry:', retryErr)
        return NextResponse.json({ success: false, error: retryErr.message }, { status: 500 })
      }
      insertedData = retryData
    } else {
      insertedData = firstTry
    }

    return NextResponse.json({
      success: true,
      message: 'Application registered successfully! Your District Exam Preferences have been recorded.',
      data: insertedData,
      provisional_admit_card: {
        application_no: insertedData.application_no,
        registration_code: insertedData.registration_code,
        applicant_name: insertedData.applicant_name,
        scholarship_title: insertedData.scholarship_title,
        photo_url: insertedData.photo_url,
        preference_district_1: selectedPrefDist1,
        preference_district_2: selectedPrefDist2,
        preference_state: selectedPrefState,
        exam_mode: targetScheme?.exam_mode || 'online',
        exam_date: targetScheme?.exam_date || '2026-09-20',
        exam_time: targetScheme?.exam_time || '10:00 AM - 12:30 PM',
        exam_venue: 'To be designated across approved centers in your preferred district upon Official Admit Card Release',
        admit_card_release_date: targetScheme?.admit_card_release_date || '2026-09-10',
        status: 'PROVISIONAL REGISTRATION ACKNOWLEDGMENT - VENUE ALLOCATION PENDING',
        note: 'Keep your Registration Code and Application Number safe. Your Official Hall Ticket containing your exact Center Address and Roll Number will be available for download once Superadmin publishes Admit Cards.',
      },
    })
  } catch (error: any) {
    console.error('Scholarship apply exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
