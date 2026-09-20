import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

// GET /api/school/scholarships
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const schoolDbId = auth.school.id || schoolId

    // 1. Fetch only assignments belonging to this school
    const [assignmentsRes, schemesRes, appsRes] = await Promise.all([
      supabaseAdmin
        .from('school_scholarships')
        .select('*')
        .or(`school_id.eq.${schoolId},school_id.eq.${schoolDbId}`),
      supabaseAdmin.from('scholarships').select('*'),
      supabaseAdmin
        .from('scholarship_applications')
        .select('id, scholarship_id, payment_status, status, exam_marks, merit_status')
        .or(`school_id.eq.${schoolId},school_id.eq.${schoolDbId}`),
    ])

    let assignments = (assignmentsRes.data && assignmentsRes.data.length > 0) ? assignmentsRes.data : []
    let schemes = (schemesRes.data && schemesRes.data.length > 0) ? schemesRes.data : []
    const applications = appsRes.data || []

    if (schemes.length === 0) {
      const defaultScheme = {
        id: 'sch-1',
        title: 'GRAVITY National STEM Excellence Scholarship',
        category: 'Merit',
        description: 'Premier national STEM scholarship for school students with fee waiver and cash rewards.',
        scholarship_value: 'Up to ₹50,000 Cash Grant + 100% Fee Waiver',
        exam_date: '2026-09-20',
        exam_time: '10:00 AM - 12:30 PM',
        exam_mode: 'online',
        status: 'published',
        application_fee: 100,
      }
      schemes = [defaultScheme]
    }

    if (assignments.length === 0 && schemes.length > 0) {
      const primaryScheme = schemes[0]
      const autoAssignment = {
        id: `ss-${Date.now()}`,
        school_id: schoolId,
        scholarship_id: primaryScheme.id,
        registration_fee: primaryScheme.application_fee || 100,
        incentive_per_verified_registration: 20,
        status: 'ACTIVE',
        start_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      assignments = [autoAssignment]

      try {
        await supabaseAdmin.from('school_scholarships').upsert(autoAssignment, { onConflict: 'school_id,scholarship_id' })
      } catch (err) {
        console.warn('Auto-assignment upsert error:', err)
      }
    }

    const schoolSchemes = assignments.map((assn) => {
      const scheme =
        schemes.find(
          (s) =>
            s.id === assn.scholarship_id ||
            s.id?.toLowerCase() === assn.scholarship_id?.toLowerCase() ||
            s.title?.toLowerCase() === assn.scholarship_id?.toLowerCase()
        ) || {
          id: assn.scholarship_id,
          title: assn.scholarship_id.replace(/^sch-/, '').replace(/-/g, ' ').toUpperCase(),
          category: 'Merit',
          description: 'Official Scholarship Program',
          scholarship_value: 'Up to ₹50,000 Cash Grant + 100% Fee Waiver',
          exam_date: '2026-09-20',
          exam_mode: 'online',
          status: 'active',
        }

      const schApps = applications.filter((a) => a.scholarship_id === assn.scholarship_id)
      const verifiedCount = schApps.filter((a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed').length
      const rate = Number(assn.incentive_per_verified_registration) || 0

      return {
        assignment_id: assn.id,
        scholarship_id: assn.scholarship_id,
        title: scheme.title,
        category: scheme.category,
        description: scheme.description,
        scholarship_value: scheme.scholarship_value,
        exam_date: scheme.exam_date,
        exam_time: scheme.exam_time,
        exam_mode: scheme.exam_mode,
        exam_venue: scheme.exam_venue,
        exam_centers: scheme.exam_centers || [
          'National Proctored Online Assessment Hub',
          'Institutional Computer Lab / Assessment Center',
        ],
        required_documents: scheme.required_documents || [
          '10th / 12th Marksheet',
          'Aadhaar Card',
          'Passport Size Photograph',
          'College ID Card',
        ],
        eligible_qualifications: scheme.eligible_qualifications || [
          '10th',
          '12th (PCM)',
          '12th (PCB)',
          '12th (Commerce/Arts)',
          'Undergraduate',
        ],
        min_percentage: scheme.min_percentage ?? 60,
        max_family_income: scheme.max_family_income ?? 8,
        terms_and_conditions: scheme.terms_and_conditions || '',
        result_date: scheme.result_date,
        scheme_status: scheme.status,
        assignment_status: assn.status,
        registration_fee: assn.registration_fee ?? scheme.application_fee ?? 0,
        incentive_per_verified_registration: rate,
        start_date: assn.start_date,
        end_date: assn.end_date,
        students_registered: schApps.length,
        verified_count: verifiedCount,
        exam_appeared_count: schApps.filter((a) => a.exam_marks !== null).length,
        qualified_count: schApps.filter((a) => a.merit_status === 'qualified').length,
        incentive_earned: verifiedCount * rate,
        is_results_declared: scheme.status === 'results_declared',
      }
    })

    return NextResponse.json({
      success: true,
      data: schoolSchemes,
    })
  } catch (error: any) {
    console.error('School scholarships GET exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
