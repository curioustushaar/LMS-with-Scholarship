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
