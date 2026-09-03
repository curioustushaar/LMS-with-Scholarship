import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

function generateAppNumber(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `SCH-2026-${randomSuffix}`
}

function generateRegistrationCode(): string {
  const randomCode = Math.floor(1000 + Math.random() * 9000)
  return `REG-CODE-${randomCode}`
}

function generateRollNumber(schoolId: string, idx: number): string {
  const shortSchool = schoolId.replace('SCH', '')
  const randomDigits = Math.floor(1000 + idx)
  return `TS2026${shortSchool}${randomDigits}`
}

// POST /api/school/students/bulk-register
export async function POST(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const school = auth.school
    const body = await request.json()
    const { scholarship_id, students } = body

    if (!scholarship_id || !Array.isArray(students) || students.length === 0) {
      return schoolErrorResponse('Scholarship ID and a non-empty array of students are required.', 400)
    }

    // 1. Fetch scheme & assignment
    const [schemeRes, assignmentRes] = await Promise.all([
      supabaseAdmin.from('scholarships').select('*').eq('id', scholarship_id).maybeSingle(),
      supabaseAdmin.from('school_scholarships').select('*').eq('school_id', school.school_id).eq('scholarship_id', scholarship_id).maybeSingle(),
    ])

    const scheme = schemeRes.data
    const assignment = assignmentRes.data
    const schemeTitle = scheme?.title || 'National Scholarship'
    const feeAmount = assignment?.registration_fee ?? scheme?.application_fee ?? 0

    // 2. Fetch existing registrations for duplicate detection
    const { data: existingApps } = await supabaseAdmin
      .from('scholarship_applications')
      .select('applicant_email, applicant_phone, school_roll_number, roll_number')
      .eq('scholarship_id', scholarship_id)

    const existingEmails = new Set((existingApps || []).map((a) => a.applicant_email?.toLowerCase()))
    const existingPhones = new Set((existingApps || []).map((a) => a.applicant_phone))

    const batchId = `BATCH-${school.school_id}-${Date.now().toString().slice(-4)}`
    const successfulRecords: any[] = []
    const failedRecords: { row: number; name: string; error: string }[] = []

    const seenInFileEmails = new Set<string>()

    for (let i = 0; i < students.length; i++) {
      const row = students[i]
      const rowNum = i + 1

      // Validate required fields
      if (!row.applicant_name?.trim()) {
        failedRecords.push({ row: rowNum, name: 'Unknown', error: 'Student Name is required.' })
        continue
      }

      const name = row.applicant_name.trim()
      const studentClass = row.school_class?.trim() || row.qualification?.trim() || '10th'
      const gender = row.gender?.trim() || 'Not Specified'
      const dob = row.dob?.trim() || '2008-01-01'
      const schoolRoll = row.school_roll_number?.trim() || `ROLL-${rowNum}`
      const parentName = row.father_name?.trim() || row.parent_name?.trim() || 'Guardian'
      const phone = row.applicant_phone?.trim() || school.mobile || '+91 9800000000'
      const email = (row.applicant_email?.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}_${i}@schoolstudent.internal`).toLowerCase()

      // In-file duplicate check
      if (seenInFileEmails.has(email)) {
        failedRecords.push({ row: rowNum, name, error: `Duplicate email '${email}' found multiple times in upload file.` })
        continue
      }
      seenInFileEmails.add(email)

      // Database duplicate check
      if (existingEmails.has(email)) {
        failedRecords.push({ row: rowNum, name, error: `Student '${name}' (${email}) is already registered for this scholarship.` })
        continue
      }

      const rollNumber = generateRollNumber(school.school_id, 100 + i)
      const applicantId = `app-bulk-${Date.now()}-${i}`

      const studentRecord = {
        id: applicantId,
        application_no: generateAppNumber(),
        registration_code: generateRegistrationCode(),
        scholarship_id: scholarship_id,
        scholarship_title: schemeTitle,
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        qualification: studentClass,
        percentage: Number(row.percentage) || 80,
        annual_family_income: 5.0,
        category: row.category || 'General',
        father_name: parentName,
        mother_name: row.mother_name?.trim() || '',
        gender,
        dob,
        address: school.address || '',
        state: school.state || '',
        city: school.city || '',
        pincode: school.pincode || '',
        school_college_name: school.name,
        passing_year: '2026',
        exam_city_preference: school.city || 'School Assessment Hub',
        photo_url: row.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
        status: 'confirmed',
        registration_source: 'SCHOOL',
        school_id: school.school_id,
        school_name: school.name,
        school_roll_number: schoolRoll,
        school_class: studentClass,
        school_section: row.school_section?.trim() || 'A',
        batch_id: batchId,
        payment_status: 'paid',
        payment_reference: `BULK_PAY_${batchId}`,
        payment_amount: feeAmount,
        admit_card_status: 'released',
        roll_number: rollNumber,
        exam_center: `${school.name} Proctored Lab`,
        exam_slot: '2026-09-20 | 10:00 AM - 12:30 PM',
        admit_card_issued_at: new Date().toISOString(),
        documents: {
          school_class: studentClass,
          school_section: row.school_section?.trim() || 'A',
          school_roll_number: schoolRoll,
          school_approval_status: 'APPROVED',
          school_verified_at: new Date().toISOString(),
          registered_by_school_id: school.school_id,
          registered_by_school_name: school.name,
        },
        document_status: 'verified',
        award_status: 'none',
        merit_status: 'waiting',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      successfulRecords.push(studentRecord)
      existingEmails.add(email)
    }

    // 3. Insert successful records into scholarship_applications
    if (successfulRecords.length > 0) {
      const { error: bulkInsertErr } = await supabaseAdmin
        .from('scholarship_applications')
        .insert(successfulRecords)

      if (bulkInsertErr) {
        console.warn('Bulk insert into scholarship_applications warning:', bulkInsertErr.message)
      }
    }

    // 4. Record batch in public.school_registration_batches
    const batchRecord = {
      id: batchId,
      school_id: school.school_id,
      scholarship_id,
      total_records: students.length,
      successful_records: successfulRecords.length,
      failed_records: failedRecords.length,
      error_log: failedRecords,
      created_at: new Date().toISOString(),
    }

    await supabaseAdmin.from('school_registration_batches').insert(batchRecord)

    return NextResponse.json({
      success: true,
      message: `Bulk registration completed! ${successfulRecords.length} students enrolled successfully, ${failedRecords.length} records skipped.`,
      batch: batchRecord,
      successful_count: successfulRecords.length,
      failed_count: failedRecords.length,
      errors: failedRecords,
    })
  } catch (error: any) {
    console.error('Bulk registration exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
