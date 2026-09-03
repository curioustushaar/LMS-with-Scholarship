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
      city,
      pincode,
      school_college_name,
      passing_year,
      exam_city_preference,
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
      state: state?.trim() || '',
      city: city?.trim() || '',
      pincode: pincode?.trim() || '',
      school_college_name: inputSchoolName?.trim() || school_college_name?.trim() || '',
      school_name: inputSchoolName?.trim() || school_college_name?.trim() || '',
      school_roll_number: school_roll_no?.trim() || '',
      school_class: school_class?.trim() || qualification || '',
      school_section: school_section?.trim() || '',
      passing_year: passing_year?.trim() || '2026',
      exam_city_preference: exam_city_preference || 'National Online Center',
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
    const { data: insertedData, error: insertErr } = await supabaseAdmin
      .from('scholarship_applications')
      .insert(newApplicant)
      .select()
      .single()

    if (insertErr) {
      console.error('Error inserting scholarship application:', insertErr)
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Application confirmed! Your Provisional Admit Card and Registration Code have been generated.',
      data: insertedData,
      provisional_admit_card: {
        application_no: insertedData.application_no,
        registration_code: insertedData.registration_code,
        applicant_name: insertedData.applicant_name,
        scholarship_title: insertedData.scholarship_title,
        photo_url: insertedData.photo_url,
        exam_mode: targetScheme?.exam_mode || 'online',
        exam_date: targetScheme?.exam_date || '2026-09-20',
        exam_time: targetScheme?.exam_time || '10:00 AM - 12:30 PM',
        exam_venue: targetScheme?.exam_venue || 'National Proctored Online Platform',
        admit_card_release_date: targetScheme?.admit_card_release_date || '2026-09-10',
        status: 'PROVISIONAL - PENDING SUPERADMIN OFFICIAL RELEASE',
        note: 'Keep your Registration Code safe. Once approved by Superadmin, use your Registration Code to download the Official Main Hall Ticket.',
      },
    })
  } catch (error: any) {
    console.error('Scholarship apply exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
