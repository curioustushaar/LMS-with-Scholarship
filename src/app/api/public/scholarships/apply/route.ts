import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendScholarshipPaymentEmail } from '@/lib/email'
import { validateName, validatePhone, validateEmail, validatePincode, validatePercentage } from '@/lib/scholarship-validation'
import { checkCustomRateLimit, getClientIP } from '@/lib/rateLimit'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

async function generateUniqueAppNumber(): Promise<string> {
  // Check against DB to guarantee uniqueness under load
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5)
    const candidate = `SCH-2026-${randomSuffix}`
    const { data } = await supabaseAdmin
      .from('scholarship_applications')
      .select('id')
      .eq('application_no', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  return `SCH-2026-${crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`
}

async function generateUniqueRegistrationCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5)
    const candidate = `REG-${randomCode}`
    const { data } = await supabaseAdmin
      .from('scholarship_applications')
      .select('id')
      .eq('registration_code', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  return `REG-${crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6)}`
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

    // ── TIMING: T1 = starting DB lookups ─────────────────────────────────
    const T1 = Date.now()
    console.log(`[${correlationId}] T1 validation done (+${T1 - T0}ms), starting DB lookups`)

    // Run idempotency check (by payment reference) and scheme lookup in parallel
    const [idempotencyResult, schemeResult] = await Promise.all([
      // Query A: Idempotency — if same Razorpay payment_id already processed
      (payment_reference && payment_reference.startsWith('pay_'))
        ? supabaseAdmin
            .from('scholarship_applications')
            .select('*')
            .eq('payment_reference', payment_reference)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),

      // Query B: Fetch scholarship scheme details
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
    const finalPaymentRef = payment_reference || (effectiveFee > 0 ? `PAY_TXN_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}` : (refDiscountPercent === 100 ? `REF_100_FREE_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}` : `FREE_TIER_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`))

    const selectedPrefState = preference_state || state || 'Bihar'
    const selectedPrefDist1 = preference_district_1 || district || city || 'Patna'
    const selectedPrefDist2 = preference_district_2 || 'Gaya'

    // ── Generate Unique Identifiers (Concurrency-safe and verified against DB) ──
    const [applicationNo, regCode] = await Promise.all([
      generateUniqueAppNumber(),
      generateUniqueRegistrationCode(),
    ])
    const applicantId = `app-${crypto.randomUUID()}`

    const newApplicant = {
      id: applicantId,
      application_no: applicationNo,
      registration_code: regCode,
      scholarship_id: scholarship_id,
      scholarship_title: schemeTitle,
      applicant_name: applicant_name.trim(),
      applicant_email: cleanEmail,
      applicant_phone: cleanPhone,
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

    // ── TIMING: T3 = DB insert starting ──────────────────────────────────
    const T3 = Date.now()
    console.log(`[${correlationId}] T3 DB insert starting (+${T3 - T0}ms)`)

    let insertedData: any = null
    const { data: firstTry, error: insertErr } = await supabaseAdmin
      .from('scholarship_applications')
      .insert(newApplicant)
      .select()
      .single()

    if (insertErr) {
      console.warn(`[${correlationId}] Initial insert notice:`, insertErr.message, insertErr.code)

      // 1. Race condition check on payment_reference (concurrent duplicate submission)
      if (insertErr.code === '23505' && insertErr.message?.includes('payment_reference')) {
        const { data: existingAfterRace } = await supabaseAdmin
          .from('scholarship_applications')
          .select('*')
          .eq('payment_reference', finalPaymentRef)
          .maybeSingle()

        if (existingAfterRace) {
          console.log(`[${correlationId}] Race condition resolved idempotently for payment_ref=${finalPaymentRef}`)
          return NextResponse.json({
            success: true,
            message: 'Application already confirmed (idempotent race resolution).',
            data: existingAfterRace,
            provisional_admit_card: {
              application_no: existingAfterRace.application_no,
              registration_code: existingAfterRace.registration_code,
              applicant_name: existingAfterRace.applicant_name,
              scholarship_title: existingAfterRace.scholarship_title,
              photo_url: existingAfterRace.photo_url,
              preference_district_1: selectedPrefDist1,
              preference_district_2: selectedPrefDist2,
              preference_state: selectedPrefState,
              exam_mode: targetScheme?.exam_mode || 'online',
              exam_date: targetScheme?.exam_date || '2026-09-20',
              exam_time: targetScheme?.exam_time || '10:00 AM - 12:30 PM',
              exam_venue: 'To be designated across approved centers in your preferred district upon Official Admit Card Release',
              admit_card_release_date: targetScheme?.admit_card_release_date || '2026-09-10',
              status: 'PROVISIONAL REGISTRATION ACKNOWLEDGMENT - VENUE ALLOCATION PENDING',
              note: 'Keep your Registration Code and Application Number safe.',
            },
          })
        }
      }

      // 2. Random identifier collision retry (if application_no or registration_code hit unique constraint)
      let candidateApplicant = { ...newApplicant }
      if (insertErr.code === '23505' && (insertErr.message?.includes('application_no') || insertErr.message?.includes('registration_code'))) {
        const [freshAppNo, freshRegCode] = await Promise.all([
          generateUniqueAppNumber(),
          generateUniqueRegistrationCode(),
        ])
        candidateApplicant.application_no = freshAppNo
        candidateApplicant.registration_code = freshRegCode
      }

      // 3. Fallback: embed district/preference/reference_code into documents JSONB and retry
      const safeDocuments = {
        ...(candidateApplicant.documents || {}),
        district: candidateApplicant.district,
        state: candidateApplicant.state,
        city: candidateApplicant.city,
        pincode: candidateApplicant.pincode,
        preference_state: candidateApplicant.preference_state,
        preference_district_1: candidateApplicant.preference_district_1,
        preference_district_2: candidateApplicant.preference_district_2,
        reference_code: cleanRefCode,
      }

      const fallbackApplicant: any = { ...candidateApplicant }
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
        console.error(`[${correlationId}] Insert failed permanently:`, retryErr)
        // STRICT RULE: If DB insertion fails:
        // - DO NOT send an application-success email.
        // - DO NOT use another student's application data as fallback.
        // - Return a proper error.
        // - Log the error safely.
        return NextResponse.json({
          success: false,
          error: 'Failed to record application in database. Please contact support with payment reference: ' + finalPaymentRef
        }, { status: 500 })
      }
      insertedData = retryData
    } else {
      insertedData = firstTry
    }

    if (!insertedData || !insertedData.id) {
      console.error(`[${correlationId}] DB insert did not return confirmed record`)
      return NextResponse.json({
        success: false,
        error: 'Application confirmation failed. No record created in database.'
      }, { status: 500 })
    }

    // ── TIMING: T6 = DB insert done ───────────────────────────────────────
    const T6 = Date.now()
    console.log(`[${correlationId}] T6 DB insert done (+${T6 - T3}ms) total_so_far=${T6 - T0}ms`)

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
