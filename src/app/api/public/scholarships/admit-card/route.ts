import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/public/scholarships/admit-card
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { application_no, registration_code, email } = body

    if (!application_no?.trim() && !email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter your Application Number or Registered Email.' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('scholarship_applications')
      .select('*, scholarships(*)')

    if (application_no?.trim()) {
      query = query.ilike('application_no', application_no.trim())
    } else if (email?.trim()) {
      query = query.ilike('applicant_email', email.trim())
    }

    const { data: candidates, error: fetchErr } = await query
    if (fetchErr) {
      console.error('Error querying candidate:', fetchErr)
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 })
    }

    const candidate = candidates?.[0]
    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          error: 'No application found with the provided details. Please verify your Application Number or Email.',
        },
        { status: 404 }
      )
    }

    if (registration_code?.trim()) {
      const formattedInput = registration_code.trim().toUpperCase()
      const formattedStored = candidate.registration_code ? candidate.registration_code.trim().toUpperCase() : ''
      if (formattedInput !== formattedStored && !formattedStored.includes(formattedInput)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid Registration Code. Please check the code received on your Provisional Admit Card.',
          },
          { status: 401 }
        )
      }
    }

    const scheme = candidate.scholarships
    const isSchoolPartner = candidate.school_id || candidate.registration_source === 'SCHOOL'
    const schoolApproval = candidate.documents?.school_approval_status || (candidate.registration_source === 'SCHOOL' && candidate.documents?.registered_by_school_id ? 'APPROVED' : 'PENDING')
    const isSchoolApproved = !isSchoolPartner || schoolApproval === 'APPROVED'
    const isSchoolRejected = isSchoolPartner && (schoolApproval === 'REJECTED' || candidate.admit_card_status === 'withheld_school_rejected')

    const isOfficialReleased = isSchoolApproved && (candidate.admit_card_status === 'released' || candidate.admit_card_status === 'approved')

    let admitCardStatus = 'PROVISIONAL REGISTRATION (SUPERADMIN APPROVAL PENDING)'
    let customInstructions = [
      'Candidate must carry a printed copy of this Admit Card along with an original Photo ID proof (Aadhaar/PAN/School ID).',
      'Ensure the uploaded photograph and signature are clearly visible on this printed hall ticket.',
      'For online exams, log in 30 minutes prior to the test slot using your Roll Number and Registration Code.',
      'Electronic gadgets, smartwatches, and unauthorized calculators are strictly prohibited inside examination premises.',
      'Any malpractice or impersonation will lead to immediate disqualification and cancellation of scholarship candidature.',
    ]

    if (isSchoolRejected) {
      admitCardStatus = 'WITHHELD (REJECTED BY PARTNER SCHOOL)'
      customInstructions = [
        `⚠️ Your enrollment was rejected by your school partner (${candidate.school_name || candidate.school_id}).`,
        'Reason: ' + (candidate.documents?.school_rejection_reason || 'Institutional record mismatch or unverified by school.'),
        'Please contact your school principal or administration office to resolve this issue.',
      ]
    } else if (isSchoolPartner && !isSchoolApproved) {
      admitCardStatus = 'AWAITING SCHOOL APPROVAL (PROVISIONAL)'
      customInstructions = [
        `⏳ Pending School Verification: Your enrollment is currently awaiting verification from ${candidate.school_name || candidate.school_id}.`,
        'As per scholarship guidelines, Admit Cards are released only after your school authority verifies your Class, Section, and Roll Number.',
        'Once approved by your school, your official Hall Ticket will be automatically generated.',
      ]
    } else if (isOfficialReleased) {
      admitCardStatus = 'OFFICIAL HALL TICKET ISSUED'
    }

    return NextResponse.json({
      success: true,
      data: {
        applicant: {
          id: candidate.id,
          application_no: candidate.application_no,
          registration_code: candidate.registration_code,
          applicant_name: candidate.applicant_name,
          applicant_email: candidate.applicant_email,
          applicant_phone: candidate.applicant_phone,
          qualification: candidate.qualification,
          father_name: candidate.father_name || 'Guardian',
          mother_name: candidate.mother_name || '',
          gender: candidate.gender || 'Not Specified',
          dob: candidate.dob || '2006-05-15',
          category: candidate.category || 'General',
          address: candidate.address || 'India',
          state: candidate.state || '',
          city: candidate.city || '',
          pincode: candidate.pincode || '',
          school_college_name: candidate.school_college_name || '',
          school_name: candidate.school_name || '',
          school_id: candidate.school_id || '',
          school_approval_status: isSchoolPartner ? schoolApproval : 'NOT_APPLICABLE',
          photo_url: candidate.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
          signature_url: candidate.signature_url || '',
          payment_status: candidate.payment_status,
          payment_reference: candidate.payment_reference,
        },
        scholarship: {
          id: scheme?.id || candidate.scholarship_id,
          title: scheme?.title || candidate.scholarship_title,
          category: scheme?.category || 'Merit',
          scholarship_value: scheme?.scholarship_value || 'Tuition Fee Waiver',
          reward_type: scheme?.reward_type || 'fee_waiver',
          exam_date: scheme?.exam_date || '2026-09-20',
          exam_time: scheme?.exam_time || '10:00 AM - 12:30 PM',
          exam_mode: scheme?.exam_mode || 'online',
          exam_venue: scheme?.exam_venue || 'Online Examination Platform',
        },
        admit_card: {
          is_official: isOfficialReleased,
          status: admitCardStatus,
          school_approved: isSchoolApproved,
          school_rejected: isSchoolRejected,
          roll_number: isOfficialReleased ? (candidate.roll_number || `AAGAJ-26-${candidate.application_no.slice(-4)}`) : (isSchoolRejected ? 'WITHHELD' : 'APPROVAL PENDING'),
          exam_center: candidate.exam_center || scheme?.exam_venue || 'Main Proctored Assessment Hub',
          exam_slot: candidate.exam_slot || `${scheme?.exam_date || '2026-09-20'} | ${scheme?.exam_time || '10:00 AM - 12:30 PM'} (Reporting Time: 45 min prior)`,
          issued_at: candidate.admit_card_issued_at || new Date().toISOString(),
          instructions: customInstructions,
        },
      },
    })
  } catch (error: any) {
    console.error('Admit card fetch exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
