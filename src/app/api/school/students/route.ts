import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

// GET /api/school/students
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const { searchParams } = new URL(request.url)
    const scholarshipId = searchParams.get('scholarship_id')
    const studentClass = searchParams.get('class')
    const approvalStatus = searchParams.get('approval_status')
    const examStatus = searchParams.get('exam_status')
    const meritStatus = searchParams.get('merit_status')
    const query = searchParams.get('query')?.toLowerCase().trim()
    const studentType = searchParams.get('type') // 'lms' or 'scholarship'

    // If requesting LMS course-enrolled students
    if (studentType === 'lms') {
      let pQuery = supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .or(`school_id.eq.${schoolId},school_coaching.ilike.%${auth.school.name}%`)
        .order('created_at', { ascending: false })

      const { data: lmsStudents, error: lmsErr } = await pQuery

      if (lmsErr) {
        console.warn('LMS students fetch issue:', lmsErr.message)
      }

      const studentList = lmsStudents || []
      const studentIds = studentList.map((s: any) => s.id)
      let enrollmentsMap: Record<string, string[]> = {}

      if (studentIds.length > 0) {
        try {
          const { data: enrollments } = await supabaseAdmin
            .from('enrollments')
            .select('user_id, course_id, courses(id, title)')
            .in('user_id', studentIds)

          if (enrollments) {
            enrollments.forEach((e: any) => {
              if (!enrollmentsMap[e.user_id]) enrollmentsMap[e.user_id] = []
              const title = e.courses?.title || e.course_id
              if (title) enrollmentsMap[e.user_id].push(title)
            })
          }
        } catch (eErr) {
          console.warn('Enrollment courses lookup notice:', eErr)
        }
      }

      let formattedLms = studentList.map((s: any) => ({
        id: s.id,
        applicant_name: s.full_name,
        applicant_email: s.email,
        applicant_phone: s.phone,
        parents_contact: s.parents_contact,
        school_class: s.class,
        school_coaching: s.school_coaching,
        enrolled_courses: enrollmentsMap[s.id] || [],
        created_at: s.created_at,
        source: 'LMS_COURSE'
      }))

      if (query) {
        formattedLms = formattedLms.filter((s: any) =>
          s.applicant_name?.toLowerCase().includes(query) ||
          s.applicant_email?.toLowerCase().includes(query) ||
          s.applicant_phone?.toLowerCase().includes(query)
        )
      }

      return NextResponse.json({
        success: true,
        total: formattedLms.length,
        data: formattedLms
      })
    }

    let dbQuery = supabaseAdmin
      .from('scholarship_applications')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (scholarshipId && scholarshipId !== 'ALL') {
      dbQuery = dbQuery.eq('scholarship_id', scholarshipId)
    }
    if (studentClass && studentClass !== 'ALL') {
      dbQuery = dbQuery.eq('qualification', studentClass)
    }
    if (meritStatus && meritStatus !== 'ALL') {
      dbQuery = dbQuery.eq('merit_status', meritStatus)
    }

    const { data: students, error } = await dbQuery

    if (error) {
      console.warn('School students query error:', error.message)
    }

    let filtered = students || []

    // Filter by approval status
    if (approvalStatus && approvalStatus !== 'ALL') {
      filtered = filtered.filter((s) => {
        const appStatus = s.documents?.school_approval_status || (s.registration_source === 'SCHOOL' && s.documents?.registered_by_school_id ? 'APPROVED' : 'PENDING')
        return appStatus === approvalStatus
      })
    }

    if (examStatus && examStatus !== 'ALL') {
      if (examStatus === 'APPEARED') {
        filtered = filtered.filter((s) => s.exam_marks !== null)
      } else if (examStatus === 'PENDING') {
        filtered = filtered.filter((s) => s.exam_marks === null)
      }
    }

    if (query) {
      filtered = filtered.filter(
        (s) =>
          s.applicant_name?.toLowerCase().includes(query) ||
          s.application_no?.toLowerCase().includes(query) ||
          s.roll_number?.toLowerCase().includes(query) ||
          s.school_roll_number?.toLowerCase().includes(query) ||
          s.documents?.school_admission_no?.toLowerCase().includes(query) ||
          s.applicant_email?.toLowerCase().includes(query) ||
          s.applicant_phone?.toLowerCase().includes(query)
      )
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      data: filtered,
    })
  } catch (error: any) {
    console.error('School students GET exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}

// POST /api/school/students (Approve or Reject Students by School)
export async function POST(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const body = await request.json()
    const { action, student_ids, rejection_reason } = body

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return schoolErrorResponse('Please select at least one student.', 400)
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return schoolErrorResponse('Invalid action. Must be APPROVE or REJECT.', 400)
    }

    // 1. Fetch the target students belonging to this school
    const { data: targetStudents, error: fetchErr } = await supabaseAdmin
      .from('scholarship_applications')
      .select('*')
      .eq('school_id', schoolId)
      .in('id', student_ids)

    if (fetchErr) {
      return schoolErrorResponse(fetchErr.message, 500)
    }

    if (!targetStudents || targetStudents.length === 0) {
      return schoolErrorResponse('No matching student records found for your school.', 404)
    }

    const isApprove = action === 'APPROVE'

    // 2. Update each student record
    const updatePromises = targetStudents.map((s) => {
      const updatedDocs = {
        ...(s.documents || {}),
        school_approval_status: isApprove ? 'APPROVED' : 'REJECTED',
        school_verified_at: new Date().toISOString(),
        school_verified_by: auth.school?.contact_person_name || 'School Principal/Admin',
        school_rejection_reason: isApprove ? null : (rejection_reason || 'Record mismatched or unverified by school authority'),
      }

      return supabaseAdmin
        .from('scholarship_applications')
        .update({
          documents: updatedDocs,
          document_status: isApprove ? 'verified' : 'rejected_by_school',
          admit_card_status: isApprove ? (s.admit_card_status === 'withheld_school_rejected' ? 'provisional' : s.admit_card_status) : 'withheld_school_rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', s.id)
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: isApprove
        ? `Successfully verified and approved ${targetStudents.length} student(s). Their hall tickets are now authorized for release.`
        : `Successfully rejected ${targetStudents.length} student(s). Hall tickets are withheld.`,
      updated_count: targetStudents.length,
    })
  } catch (error: any) {
    console.error('School student approval error:', error)
    return schoolErrorResponse(error.message, 500)
  }
}

// PATCH /api/school/students (Edit student application details by School)
export async function PATCH(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const school = auth.school
    const schoolId = school.school_id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return schoolErrorResponse('Student Application ID is required.', 400)
    }

    // 1. Fetch student and verify they belong to this school
    const { data: targetStudent, error: fetchErr } = await supabaseAdmin
      .from('scholarship_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !targetStudent) {
      return schoolErrorResponse('Student record not found.', 404)
    }

    // Verify school ownership: student's school_id must match school.school_id or school.id
    const isOwner = targetStudent.school_id === schoolId || targetStudent.school_id === school.id || targetStudent.documents?.school_id === schoolId
    if (!isOwner) {
      return schoolErrorResponse('Unauthorized. This student is not registered under your institution.', 403)
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
    if (updates.school_class !== undefined) {
      updatePayload.school_class = updates.school_class.trim()
      updatePayload.qualification = updates.school_class.trim()
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
      const pref1 = updates.preference_district_1 || targetStudent.preference_district_1 || 'Patna'
      const pref2 = updates.preference_district_2 || targetStudent.preference_district_2 || 'Gaya'
      updatePayload.exam_city_preference = `${pref1} (Pref 1) / ${pref2} (Pref 2)`
    }

    // Merge updated documents
    const existingDocs = (typeof targetStudent.documents === 'object' && targetStudent.documents) ? targetStudent.documents : {}
    updatePayload.documents = {
      ...existingDocs,
      school_class: updatePayload.school_class || updatePayload.qualification || existingDocs.school_class || null,
      school_roll_no: updatePayload.school_roll_number || existingDocs.school_roll_no || null,
      school_admission_no: updates.school_admission_no !== undefined ? updates.school_admission_no.trim() : existingDocs.school_admission_no,
      school_section: updatePayload.school_section || existingDocs.school_section || null,
      preference_state: updatePayload.preference_state || existingDocs.preference_state || null,
      preference_district_1: updatePayload.preference_district_1 || existingDocs.preference_district_1 || null,
      preference_district_2: updatePayload.preference_district_2 || existingDocs.preference_district_2 || null,
      district: updatePayload.district || existingDocs.district || null,
      state: updatePayload.state || existingDocs.state || null,
      last_edited_by: `school:${schoolId}`,
      last_edited_at: new Date().toISOString(),
    }

    const { data: updatedRecord, error: updateErr } = await supabaseAdmin
      .from('scholarship_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      console.error('School update student application error:', updateErr)
      return schoolErrorResponse(updateErr.message, 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Student application details updated successfully.',
      data: updatedRecord,
    })
  } catch (error: any) {
    console.error('School student PATCH exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}

