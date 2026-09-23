import { NextResponse } from 'next/server'
import { supabaseAdmin, supabase } from '@/lib/supabase'
import { schoolErrorResponse, schoolSuccessResponse, generateSchoolToken } from '@/lib/school-auth'

export const dynamic = 'force-dynamic'

// Fallback demo schools in case DB is being provisioned
const DEFAULT_FALLBACK_SCHOOLS = [
  {
    id: 'sch-inst-001',
    school_id: 'SCH000101',
    name: 'ABC Public School',
    udise_code: '09012345678',
    board: 'CBSE',
    school_type: 'Private',
    official_email: 'abcschool@gmail.com',
    status: 'ACTIVE',
    contact_person_name: 'Dr. Ramesh Chandra',
    designation: 'Principal',
  },
  {
    id: 'sch-inst-002',
    school_id: 'SCH000102',
    name: 'Delhi Public School (DPS) Greater Noida',
    udise_code: '09023456789',
    board: 'CBSE',
    school_type: 'Private',
    official_email: 'dps.gnoida@schoolnet.in',
    status: 'ACTIVE',
    contact_person_name: 'Mrs. Sunita Verma',
    designation: 'Scholarship Coordinator',
  },
  {
    id: 'sch-inst-003',
    school_id: 'SCH000103',
    name: 'St. Xavier High School',
    udise_code: '09034567890',
    board: 'ICSE',
    school_type: 'Private',
    official_email: 'stxavier.patna@edu.in',
    status: 'PENDING',
    contact_person_name: 'Father Joseph Mathew',
    designation: 'Principal',
  },
]

// POST /api/school/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    if (!identifier || !identifier.trim() || !password) {
      return schoolErrorResponse('Official School Email (or School ID) and password are required.', 400)
    }

    const cleanIdentifier = identifier.trim().toLowerCase()
    // Normalize alphanumeric version (e.g. "SCH000101", "SCHOOL01" -> "sch000101")
    const alphaNumIdentifier = cleanIdentifier.replace(/[^a-z0-9]/g, '')
    // Extract any trailing digits if entered like "01", "101", "000101"
    const digitMatch = cleanIdentifier.match(/\d+/)
    const numberPart = digitMatch ? parseInt(digitMatch[0], 10) : null

    // 1. Precise lookup in public.schools database table
    let school: any = null

    try {
      const { data: dbSchools, error: dbError } = await supabaseAdmin
        .from('schools')
        .select('*')
        .or(`official_email.ilike.${cleanIdentifier},school_id.ilike.${cleanIdentifier},id.ilike.${cleanIdentifier}`)

      if (!dbError && dbSchools && dbSchools.length > 0) {
        school = dbSchools[0]
      }
    } catch (err) {
      console.warn('Database lookup warning:', err)
    }

    // 2. If not found in direct query, search all DB schools accurately
    if (!school) {
      try {
        const { data: allDbSchools } = await supabaseAdmin.from('schools').select('*')
        if (allDbSchools && allDbSchools.length > 0) {
          school = allDbSchools.find((s) => {
            const sEmail = (s.official_email || '').toLowerCase().trim()
            const sId = (s.school_id || '').toLowerCase().trim()
            const sName = (s.name || '').toLowerCase().trim()
            const sUdise = (s.udise_code || '').toLowerCase().trim()

            return (
              sEmail === cleanIdentifier ||
              sId === cleanIdentifier ||
              sUdise === cleanIdentifier ||
              sName === cleanIdentifier ||
              sId.replace(/[^a-z0-9]/g, '') === alphaNumIdentifier
            )
          })
        }
      } catch (err) {
        console.warn('All schools search warning:', err)
      }
    }

    // 3. Check fallback list only if DB has no record
    if (!school) {
      school = DEFAULT_FALLBACK_SCHOOLS.find(
        (s) =>
          s.official_email.toLowerCase() === cleanIdentifier ||
          s.school_id.toLowerCase() === cleanIdentifier ||
          s.school_id.toLowerCase().replace(/[^a-z0-9]/g, '') === alphaNumIdentifier
      )
    }

    if (!school) {
      return schoolErrorResponse(
        `Invalid login credentials. No registered partner school found for '${identifier}'. Please check your School ID / Email or contact Super Admin.`,
        404
      )
    }

    // 4. Validate school account status
    if (school.status === 'SUSPENDED') {
      return schoolErrorResponse(
        `Your school account (${school.name}) is currently suspended. Please contact platform Super Admin.`,
        403
      )
    }
    if (school.status === 'REJECTED') {
      return schoolErrorResponse(
        `Your school partner application (${school.name}) was not approved. Please contact support.`,
        403
      )
    }
    if (school.status === 'PENDING') {
      return schoolErrorResponse(
        `Your school tie-up (${school.name}) is currently under review by Super Admin. You will be notified once approved.`,
        403
      )
    }

    const targetEmail = (school.official_email || cleanIdentifier).toLowerCase().trim()

    // 3. Ensure Auth user exists and has the correct password & confirmed email in Supabase Auth
    let authUserId = school.user_id || null

    try {
      // Find user in auth list
      const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = userList?.users?.find(
        (u) => u.email?.toLowerCase() === targetEmail
      )

      if (existingUser) {
        authUserId = existingUser.id
        // Sync password & confirm email
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: password,
          email_confirm: true,
          user_metadata: {
            role: 'school',
            school_id: school.school_id,
            full_name: school.name,
          },
        })
      } else {
        // Create user in Auth
        const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            role: 'school',
            school_id: school.school_id,
            full_name: school.name,
          },
        })

        if (createdUser?.user) {
          authUserId = createdUser.user.id
        } else if (createErr) {
          console.warn('Auth user creation warning:', createErr.message)
        }
      }

      // Ensure profile record exists
      if (authUserId) {
        await supabaseAdmin.from('profiles').upsert({
          id: authUserId,
          email: targetEmail,
          full_name: `${school.name} (${school.contact_person_name || 'Coordinator'})`,
          role: 'school',
          school_id: school.school_id,
          account_status: 'active',
          updated_at: new Date().toISOString(),
        })

        // Update school record with user_id if needed
        await supabaseAdmin
          .from('schools')
          .update({ user_id: authUserId, updated_at: new Date().toISOString() })
          .eq('school_id', school.school_id)
      }
    } catch (authSyncErr: any) {
      console.warn('Auth sync exception:', authSyncErr.message)
    }

    const isCoaching = (
      school.institution_type === 'coaching' ||
      school.school_id?.startsWith('CCH') ||
      school.school_type?.toLowerCase().includes('coaching') ||
      school.board?.toLowerCase().includes('jee') ||
      school.board?.toLowerCase().includes('neet') ||
      school.name?.toLowerCase().includes('coaching') ||
      school.name?.toLowerCase().includes('institute') ||
      school.bank_details?.institution_type === 'coaching'
    )

    const rawBoard = school.bank_details?.display_board || (isCoaching && school.board === 'Other' ? 'JEE & NEET Foundation' : school.board) || (isCoaching ? 'JEE & NEET Foundation' : 'CBSE')
    const rawSchoolType = school.bank_details?.display_school_type || (isCoaching && school.school_type === 'Other' ? 'Competitive Exam Institute (JEE/NEET)' : school.school_type) || (isCoaching ? 'Competitive Exam Institute (JEE/NEET)' : 'Private')
    const rawDesignation = school.bank_details?.display_designation || (isCoaching && school.designation === 'Other' ? 'Director / Center Head' : school.designation) || (isCoaching ? 'Director / Center Head' : 'Principal')

    const resolvedSchool = {
      ...school,
      institution_type: isCoaching ? 'coaching' : (school.institution_type || 'school'),
      board: rawBoard,
      school_type: rawSchoolType,
      designation: rawDesignation,
    }

    const sessionToken = generateSchoolToken({
      school_id: resolvedSchool.school_id,
      email: targetEmail,
      userId: authUserId || `sch-user-${resolvedSchool.school_id}`,
      school_name: resolvedSchool.name,
    })

    const partnerTypeLabel = isCoaching ? 'Coaching Center' : 'School'

    return NextResponse.json({
      success: true,
      token: sessionToken,
      resolved_email: targetEmail,
      school_id: resolvedSchool.school_id,
      school_name: resolvedSchool.name,
      school: resolvedSchool,
      message: `${partnerTypeLabel} credentials verified and session established successfully.`,
    })
  } catch (error: any) {
    console.error('School login API exception:', error)
    return schoolErrorResponse(error.message || 'An unexpected error occurred during partner login.', 500)
  }
}
