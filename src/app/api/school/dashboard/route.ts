import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

// GET /api/school/dashboard
export async function GET(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const schoolId = auth.school.school_id
    const schoolDbId = auth.school.id || schoolId

    // 1. Fetch school's assigned scholarships, students, payouts, and all schemes
    const [assignmentsRes, appsRes, payoutsRes, allSchemesRes] = await Promise.all([
      supabaseAdmin
        .from('school_scholarships')
        .select('*')
        .or(`school_id.eq.${schoolId},school_id.eq.${schoolDbId}`),
      supabaseAdmin
        .from('scholarship_applications')
        .select('*')
        .or(`school_id.eq.${schoolId},school_id.eq.${schoolDbId}`)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('school_incentive_payouts')
        .select('*')
        .or(`school_id.eq.${schoolId},school_id.eq.${schoolDbId}`)
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('scholarships').select('*'),
    ])

    let assignments = (assignmentsRes.data && assignmentsRes.data.length > 0) ? assignmentsRes.data : []
    let schemes = (allSchemesRes.data && allSchemesRes.data.length > 0) ? allSchemesRes.data : []
    const applications = appsRes.data || []
    const payouts = payoutsRes.data || []

    // If no schemes in database, create default platform scholarship scheme
    if (schemes.length === 0) {
      const defaultScheme = {
        id: 'sch-1',
        title: 'GRAVITY National STEM Excellence Scholarship',
        category: 'Merit',
        description: 'Premier national STEM scholarship for school students with cash grants and merit recognition.',
        scholarship_value: 'Up to ₹50,000 Cash Grant + 100% Fee Waiver',
        application_fee: 100,
        exam_date: '2026-09-20',
        exam_time: '10:00 AM - 12:30 PM',
        exam_mode: 'online',
        status: 'published',
      }
      schemes = [defaultScheme]
    }

    // If school has no assignments yet, auto-associate with active scholarship
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

      // Persist assignment in database asynchronously
      try {
        await supabaseAdmin.from('school_scholarships').upsert(autoAssignment, { onConflict: 'school_id,scholarship_id' })
      } catch (err) {
        console.warn('Auto-assignment insert warning:', err)
      }
    }

    // 2. Metrics calculation
    const totalRegistered = applications.length
    const verifiedRegistrations = applications.filter(
      (a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed'
    ).length
    const examParticipants = applications.filter((a) => a.exam_marks !== null).length
    const qualifiedStudents = applications.filter((a) => a.merit_status === 'qualified').length

    let totalIncentiveEarned = 0
    const enrichedAssignments = assignments.map((assn) => {
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
          scholarship_value: 'Up to ₹50,000 Cash Grant + Fee Waiver',
        }

      const schApps = applications.filter((a) => a.scholarship_id === assn.scholarship_id)
      const verifiedCount = schApps.filter(
        (a) => a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed'
      ).length
      const rate = Number(assn.incentive_per_verified_registration) || 20
      const earned = verifiedCount * rate
      totalIncentiveEarned += earned

      return {
        ...assn,
        scheme,
        students_registered: schApps.length,
        verified_count: verifiedCount,
        earned,
      }
    })

    const totalPaid = payouts.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const pendingIncentive = Math.max(0, totalIncentiveEarned - totalPaid)

    return NextResponse.json({
      success: true,
      school: auth.school,
      metrics: {
        associated_scholarships_count: enrichedAssignments.filter((a) => a.status === 'ACTIVE').length,
        total_students_registered: totalRegistered,
        total_verified_registrations: verifiedRegistrations,
        total_exam_participants: examParticipants,
        total_qualified_students: qualifiedStudents,
        total_incentive_earned: totalIncentiveEarned,
        total_incentive_paid: totalPaid,
        pending_incentive: pendingIncentive,
      },
      assigned_scholarships: enrichedAssignments,
      recent_registrations: applications.slice(0, 10),
    })
  } catch (error: any) {
    console.error('School dashboard GET exception:', error)
    return schoolErrorResponse(error.message, 500)
  }
}
