import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendScholarshipPaymentEmail } from '@/lib/email'
import { validateName, validatePhone, validateEmail, validatePincode, validatePercentage } from '@/lib/scholarship-validation'
import { checkCustomRateLimit, getClientIP } from '@/lib/rateLimit'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function generateAppNumber(): string {
  // Use crypto random to avoid collisions under concurrent load
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5)
  return `SCH-2026-${randomSuffix}`
}

function generateRegistrationCode(): string {
  const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5)
  return `REG-${randomCode}`
}

// POST /api/public/scholarships/apply
export async function POST(request: Request) {
  // ── TIMING: T0 = request received ──────────────────────────────────────
  const T0 = Date.now()
  const correlationId = `pay-${crypto.randomBytes(4).toString('hex')}`
  console.log(`[${correlationId}] T0 apply request received`)

  try {
    // 0a. Rate Limiting Check (Max 5 submissions per 15 minutes per IP)
    const clientIp = getClientIP(request)
    const rateCheck = checkCustomRateLimit(`apply_app_${clientIp}`, 5, 15 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many application submissions from your IP. Please try again in ${Math.ceil(rateCheck.resetSeconds / 60)} minutes.` },
        { status: 429 }
      )
    }

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
      reference_code,
    } = body

    if (!scholarship_id) {
      return NextResponse.json({ success: false, error: 'Scholarship scheme selection is required.' }, { status: 400 })
    }

    const nameVal = validateName(applicant_name, 'Full Name')
    if (!nameVal.isValid) {
      return NextResponse.json({ success: false, error: nameVal.message }, { status: 400 })
    }

    const phoneVal = validatePhone(applicant_phone)
    if (!phoneVal.isValid) {
      return NextResponse.json({ success: false, error: phoneVal.message }, { status: 400 })
    }

    const emailVal = validateEmail(applicant_email)
    if (!emailVal.isValid) {
      return NextResponse.json({ success: false, error: emailVal.message }, { status: 400 })
    }

    if (pincode) {
      const pinVal = validatePincode(pincode)
      if (!pinVal.isValid) {
        return NextResponse.json({ success: false, error: pinVal.message }, { status: 400 })
      }
    }

    if (percentage !== undefined && percentage !== '') {
      const pctVal = validatePercentage(percentage)
      if (!pctVal.isValid) {
        return NextResponse.json({ success: false, error: pctVal.message }, { status: 400 })
      }
    }

    const cleanEmail = emailVal.cleanEmail
    const cleanPhone = phoneVal.cleanPhone
    const cleanRefCode = reference_code ? reference_code.toString().trim().toUpperCase() : null

    let refDiscountPercent = 0

    // 0. Server-Side Referral Code Re-Validation (only if code provided)
    if (cleanRefCode) {
      const { data: refRecord, error: refErr } = await supabaseAdmin
        .from('scholarship_reference_codes')
        .select('id, code, status, discount_percent')
        .eq('code', cleanRefCode)
        .maybeSingle()

      if (refErr && refErr.code !== 'PGRST205') {
        console.warn(`[${correlationId}] Notice re-validating referral code:`, refErr.message)
      } else if (!refRecord || refRecord.status !== 'active') {
        return NextResponse.json(
          { success: false, error: `The provided referral code "${cleanRefCode}" is invalid or inactive.` },
          { status: 400 }
        )
      } else if (refRecord) {
        refDiscountPercent = Math.max(0, Math.min(100, Number(refRecord.discount_percent) || 0))
      }
    }

    // ── TIMING: T1 = starting parallel DB lookups ─────────────────────────
    const T1 = Date.now()
    console.log(`[${correlationId}] T1 validation done (+${T1 - T0}ms), starting parallel DB lookups`)

    // ── FIX 2: Run independent DB queries in PARALLEL ────────────────────
    // Previously these were 3 serial awaits = 150-450ms wasted
    // Now all 3 fire simultaneously
    const [idempotencyResult, duplicateResult, schemeResult] = await Promise.all([
      // Query A: Idempotency — if same Razorpay payment_id already processed
      (payment_reference && payment_reference.startsWith('pay_'))
        ? supabaseAdmin
            .from('scholarship_applications')
            .select('*')
            .eq('payment_reference', payment_reference)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),

      // Query B: Duplicate registration check (same email + scholarship)
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .eq('scholarship_id', scholarship_id)
        .eq('applicant_email', cleanEmail)
        .maybeSingle(),

      // Query C: Fetch scholarship scheme details
      supabaseAdmin
        .from('scholarships')
        .select('*')
        .eq('id', scholarship_id)
        .single(),
    ])

    // ── TIMING: T2 = parallel DB calls done ──────────────────────────────
    const T2 = Date.now()
    console.log(`[${correlationId}] T2 parallel DB done (+${T2 - T1}ms)`)

    const existingByPayment = idempotencyResult.data
    const existingApp = duplicateResult.data
    const targetScheme = schemeResult.data
    const schemeErr = schemeResult.error

    // Handle idempotent re-request (same Razorpay payment already processed)
    if (existingByPayment) {
      console.log(`[${correlationId}] Idempotent hit for payment_reference=${payment_reference} total=${Date.now() - T0}ms`)
      return NextResponse.json({
        success: true,
        message: 'Application already confirmed (idempotent).',
        data: existingByPayment,
        provisional_admit_card: {
          application_no: existingByPayment.application_no,
          registration_code: existingByPayment.registration_code,
          applicant_name: existingByPayment.applicant_name,
          scholarship_title: existingByPayment.scholarship_title,
          photo_url: existingByPayment.photo_url,
          preference_district_1: existingByPayment.preference_district_1 || existingByPayment.documents?.preference_district_1 || 'Patna',
          preference_district_2: existingByPayment.preference_district_2 || existingByPayment.documents?.preference_district_2 || 'Gaya',
          preference_state: existingByPayment.preference_state || existingByPayment.documents?.preference_state || 'Bihar',
          exam_mode: 'online',
          exam_date: '2026-09-20',
          exam_time: '10:00 AM - 12:30 PM',
          exam_venue: 'To be designated across approved centers in your preferred district upon Official Admit Card Release',
          admit_card_release_date: '2026-09-10',
          status: 'PROVISIONAL REGISTRATION ACKNOWLEDGMENT - VENUE ALLOCATION PENDING',
          note: 'Keep your Registration Code and Application Number safe.',
        },
      })
    }

    // Scheme must exist
    if (schemeErr || !targetScheme) {
      console.error(`[${correlationId}] Scheme not found for scholarship_id=${scholarship_id}`)
      return NextResponse.json({ success: false, error: 'Selected scholarship scheme not found.' }, { status: 404 })
    }

    const schemeTitle = targetScheme.title || 'National Scholarship Program'
    const rawFee = targetScheme.application_fee !== undefined && targetScheme.application_fee !== null
      ? Number(targetScheme.application_fee)
      : (payment_amount !== undefined && payment_amount !== null ? Number(payment_amount) : 0)
    const originalFee = isNaN(rawFee) ? 0 : rawFee
    const discountAmount = Math.round((originalFee * refDiscountPercent) / 100)

    // Determine effective fee:
    // 1. If 100% referral discount → fee is 0
    // 2. If explicit payment_amount passed (from Razorpay transaction) → trust it
    // 3. Otherwise compute originalFee - discountAmount
    let effectiveFee = 0
    if (refDiscountPercent === 100) {
      effectiveFee = 0
    } else if (payment_amount !== undefined && payment_amount !== null && !isNaN(Number(payment_amount))) {
      effectiveFee = Number(payment_amount)
    } else {
      effectiveFee = Math.max(0, originalFee - discountAmount)
    }

    const paymentStatus = effectiveFee === 0 ? 'free' : 'paid'
    const finalPaymentRef = payment_reference || (effectiveFee > 0 ? `PAY_TXN_${Date.now().toString().slice(-8)}` : (refDiscountPercent === 100 ? 'REF_100_DISCOUNT_FREE' : 'FREE_TIER'))

    const selectedPrefState = preference_state || state || 'Bihar'
    const selectedPrefDist1 = preference_district_1 || district || city || 'Patna'
    const selectedPrefDist2 = preference_district_2 || 'Gaya'

    // Handle duplicate / re-attempt (existing application found for same email+scholarship)
    if (existingApp) {
      const updatedDocs = {
        ...(existingApp.documents || {}),
        ...(typeof documents === 'object' && documents ? documents : {}),
        academic_records: academic_records || existingApp.documents?.academic_records || [],
        reference_code: cleanRefCode || existingApp.reference_code,
        payment_reference: finalPaymentRef,
        payment_amount: effectiveFee,
        updated_via: 'paid_confirmation',
      }

      const updatePayload: Record<string, any> = {
        applicant_name: applicant_name?.trim() || existingApp.applicant_name,
        applicant_phone: applicant_phone?.trim() || existingApp.applicant_phone,
        status: 'confirmed',
        payment_status: paymentStatus,
        payment_reference: finalPaymentRef,
        payment_amount: effectiveFee,
        documents: updatedDocs,
        updated_at: new Date().toISOString(),
      }

      if (photo_url) updatePayload.photo_url = photo_url
      if (signature_url) updatePayload.signature_url = signature_url
      if (aadhaar_url) updatePayload.aadhaar_url = aadhaar_url
      if (marksheet_url) updatePayload.marksheet_url = marksheet_url

      // ── TIMING: T3 = DB update starting ──────────────────────────────
      const T3 = Date.now()
      const { data: updatedApp } = await supabaseAdmin
        .from('scholarship_applications')
        .update(updatePayload)
        .eq('id', existingApp.id)
        .select()
        .single()

      const T4 = Date.now()
      console.log(`[${correlationId}] T4 DB update done (+${T4 - T3}ms) total_so_far=${T4 - T0}ms`)

      const finalRecord = updatedApp || { ...existingApp, ...updatePayload }

      // Fire email asynchronously — does NOT block receipt
      if (finalRecord?.applicant_email) {
        sendScholarshipPaymentEmail({
          applicant_name: finalRecord.applicant_name,
          applicant_email: finalRecord.applicant_email,
          application_no: finalRecord.application_no,
          registration_code: finalRecord.registration_code,
          scholarship_title: finalRecord.scholarship_title || schemeTitle,
          father_name: finalRecord.father_name,
          payment_reference: finalPaymentRef,
          amount: effectiveFee,
        }).catch((err) => console.error(`[${correlationId}] Email send error on update:`, err))
      }

      const Tfinal = Date.now()
      console.log(`[${correlationId}] DONE (update path) total=${Tfinal - T0}ms`)

      return NextResponse.json({
        success: true,
        message: 'Payment verified and scholarship application confirmed successfully!',
        data: finalRecord,
        provisional_admit_card: {
          application_no: finalRecord.application_no,
          registration_code: finalRecord.registration_code,
          applicant_name: finalRecord.applicant_name,
          scholarship_title: finalRecord.scholarship_title || schemeTitle,
          photo_url: finalRecord.photo_url,
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
    }

    // ── New application: generate unique IDs ─────────────────────────────
    const applicationNo = generateAppNumber()
    const regCode = generateRegistrationCode()
    const applicantId = `app-${crypto.randomUUID()}`

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
      exam_city_preference: exam_city_preference || `${selectedPrefDist1} (Pref 1) / ${selectedPrefDist2} (Pref 2)`,
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
      reference_code: cleanRefCode,
      documents: {
        // NOTE: We do NOT embed full base64 here — they are already stored in top-level URL fields
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
        reference_code: cleanRefCode,
        referral_discount_percent: refDiscountPercent,
        referral_discount_amount: discountAmount,
        original_fee: originalFee,
        effective_fee: effectiveFee,
      },
      status: 'confirmed',
      registration_source: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? 'SCHOOL' : 'DIRECT',
      school_id: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? inputSchoolId : null,
      payment_status: paymentStatus,
      payment_reference: finalPaymentRef,
      payment_amount: effectiveFee,
      admit_card_status: 'provisional',
      document_status: (application_type === 'SCHOOL_PARTNER' || inputSchoolId) ? 'pending_school_verification' : 'pending',
      award_status: 'none',
      merit_status: 'waiting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // ── TIMING: T5 = DB insert starting ──────────────────────────────────
    const T5 = Date.now()
    console.log(`[${correlationId}] T5 DB insert starting (+${T5 - T0}ms)`)

    let insertedData: any = null
    const { data: firstTry, error: insertErr } = await supabaseAdmin
      .from('scholarship_applications')
      .insert(newApplicant)
      .select()
      .single()

    if (insertErr) {
      console.warn(`[${correlationId}] Initial insert notice (possible missing column):`, insertErr.message)

      // Fallback: embed district/preference/reference_code into documents JSONB and retry
      const safeDocuments = {
        ...(newApplicant.documents || {}),
        district: newApplicant.district,
        state: newApplicant.state,
        city: newApplicant.city,
        pincode: newApplicant.pincode,
        preference_state: newApplicant.preference_state,
        preference_district_1: newApplicant.preference_district_1,
        preference_district_2: newApplicant.preference_district_2,
        reference_code: cleanRefCode,
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
      delete fallbackApplicant.reference_code
      fallbackApplicant.documents = safeDocuments

      const { data: retryData, error: retryErr } = await supabaseAdmin
        .from('scholarship_applications')
        .insert(fallbackApplicant)
        .select()
        .single()

      if (retryErr) {
        console.error(`[${correlationId}] Insert retry error:`, retryErr)
        return NextResponse.json({ success: false, error: retryErr.message }, { status: 500 })
      }
      insertedData = retryData
    } else {
      insertedData = firstTry
    }

    // ── TIMING: T6 = DB insert done ───────────────────────────────────────
    const T6 = Date.now()
    console.log(`[${correlationId}] T6 DB insert done (+${T6 - T5}ms) total_so_far=${T6 - T0}ms`)

    // ── Fire email AFTER response is queued — does NOT block receipt ──────
    if (insertedData?.applicant_email) {
      setImmediate(() => {
        sendScholarshipPaymentEmail({
          applicant_name: insertedData.applicant_name,
          applicant_email: insertedData.applicant_email,
          application_no: insertedData.application_no,
          registration_code: insertedData.registration_code,
          scholarship_title: insertedData.scholarship_title,
          father_name: insertedData.father_name,
          payment_reference: insertedData.payment_reference,
          amount: insertedData.payment_amount !== undefined && insertedData.payment_amount !== null
            ? insertedData.payment_amount
            : effectiveFee,
        }).catch((err) => console.error(`[${correlationId}] Email send error on insert:`, err))
      })
    }

    const Tfinal = Date.now()
    console.log(`[${correlationId}] DONE (insert path) total=${Tfinal - T0}ms app_no=${insertedData?.application_no}`)

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
    console.error(`[${correlationId}] Scholarship apply exception:`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
