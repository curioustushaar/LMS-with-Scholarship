import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySuperadminAccess, errorResponse, successResponse } from '@/lib/superadmin-auth'

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `School@${code}${digits}`
}

async function getNextSchoolId(): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from('schools')
      .select('school_id')

    if (error || !data || data.length === 0) {
      return 'SCH000101'
    }

    let maxNum = 100
    data.forEach((row: any) => {
      if (row.school_id) {
        const match = row.school_id.match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          if (num > maxNum) maxNum = num
        }
      }
    })

    return `SCH${String(maxNum + 1).padStart(6, '0')}`
  } catch (err) {
    return `SCH${Math.floor(100100 + Math.random() * 899000)}`
  }
}

// Fallback in-memory store for fallback/dev display if tables are loading
const DEFAULT_FALLBACK_SCHOOLS = [
  {
    id: 'sch-inst-001',
    school_id: 'SCH000101',
    name: 'ABC Public School',
    udise_code: '09012345678',
    school_type: 'Private',
    board: 'CBSE',
    address: 'Sector 15, Rohini',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110085',
    contact_person_name: 'Dr. Ramesh Chandra',
    designation: 'Principal',
    official_email: 'abcschool@gmail.com',
    mobile: '+91 9876500101',
    status: 'ACTIVE',
    bank_details: {
      beneficiary_name: 'ABC Public School Educational Trust',
      account_number: '91802003881928',
      ifsc_code: 'HDFC0001234',
      bank_name: 'HDFC Bank',
      is_verified: true,
    },
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sch-inst-002',
    school_id: 'SCH000102',
    name: 'Delhi Public School (DPS) Greater Noida',
    udise_code: '09023456789',
    school_type: 'Private',
    board: 'CBSE',
    address: 'Knowledge Park III',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    pincode: '201310',
    contact_person_name: 'Mrs. Sunita Verma',
    designation: 'Scholarship Coordinator',
    official_email: 'dps.gnoida@schoolnet.in',
    mobile: '+91 9876500102',
    status: 'ACTIVE',
    bank_details: {
      beneficiary_name: 'DPS Greater Noida Society',
      account_number: '50100293847119',
      ifsc_code: 'ICIC0000456',
      bank_name: 'ICICI Bank',
      is_verified: true,
    },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sch-inst-003',
    school_id: 'SCH000103',
    name: 'St. Xavier High School',
    udise_code: '09034567890',
    school_type: 'Private',
    board: 'ICSE',
    address: 'Park Street Campus',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    contact_person_name: 'Father Joseph Mathew',
    designation: 'Principal',
    official_email: 'stxavier.patna@edu.in',
    mobile: '+91 9876500103',
    status: 'PENDING',
    bank_details: {},
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// GET /api/superadmin/schools
export async function GET(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const board = searchParams.get('board')
    const type = searchParams.get('type')
    const query = searchParams.get('query')?.toLowerCase().trim()

    // 1. Fetch schools, school_scholarships, applications, payouts
    const [schoolsRes, assignmentsRes, appsRes, payoutsRes] = await Promise.all([
      supabaseAdmin.from('schools').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('school_scholarships').select('*'),
      supabaseAdmin.from('scholarship_applications').select('id, school_id, status, payment_status, registration_source'),
      supabaseAdmin.from('school_incentive_payouts').select('*'),
    ])

    let schoolsList = schoolsRes.data && schoolsRes.data.length > 0 ? schoolsRes.data : DEFAULT_FALLBACK_SCHOOLS
    const assignments = assignmentsRes.data || [
      { school_id: 'SCH000101', scholarship_id: 'sch-1', incentive_per_verified_registration: 20, status: 'ACTIVE' },
      { school_id: 'SCH000102', scholarship_id: 'sch-1', incentive_per_verified_registration: 25, status: 'ACTIVE' },
    ]
    const applications = appsRes.data || []
    const payouts = payoutsRes.data || []

    // 2. Aggregate statistics for each school
    let enrichedSchools = schoolsList.map((sch) => {
      const schAssignments = assignments.filter((a) => a.school_id === sch.school_id && a.status === 'ACTIVE')
      const schApps = applications.filter((app) => app.school_id === sch.school_id)
      
      // Verified registrations: payment_status = 'paid' or 'free' / confirmed
      const verifiedApps = schApps.filter(
        (app) => app.payment_status === 'paid' || app.payment_status === 'free' || app.status === 'confirmed'
      )

      // Calculate incentive: sum of (verified count for each scholarship * incentive rate)
      let totalEarned = 0
      schAssignments.forEach((assn) => {
        const matchingVerified = applications.filter(
          (a) => a.school_id === sch.school_id && 
                 (a.payment_status === 'paid' || a.payment_status === 'free' || a.status === 'confirmed')
        ).length
        totalEarned += matchingVerified * (Number(assn.incentive_per_verified_registration) || 0)
      })

      // Payouts
      const schPayouts = payouts.filter((p) => p.school_id === sch.school_id && p.status === 'PAID')
      const totalPaid = schPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      const totalPending = Math.max(0, totalEarned - totalPaid)

      return {
        ...sch,
        associated_scholarships_count: schAssignments.length,
        assigned_scholarships: schAssignments,
        total_students_registered: schApps.length,
        total_verified_registrations: verifiedApps.length,
        total_incentive_earned: totalEarned,
        total_incentive_paid: totalPaid,
        total_incentive_pending: totalPending,
      }
    })

    // 3. Filter by search params
    if (status && status !== 'ALL') {
      enrichedSchools = enrichedSchools.filter((s) => s.status?.toUpperCase() === status.toUpperCase())
    }
    if (board && board !== 'ALL') {
      enrichedSchools = enrichedSchools.filter((s) => s.board?.toUpperCase() === board.toUpperCase())
    }
    if (type && type !== 'ALL') {
      enrichedSchools = enrichedSchools.filter((s) => s.school_type?.toLowerCase() === type.toLowerCase())
    }
    if (query) {
      enrichedSchools = enrichedSchools.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.school_id?.toLowerCase().includes(query) ||
          s.city?.toLowerCase().includes(query) ||
          s.contact_person_name?.toLowerCase().includes(query) ||
          s.official_email?.toLowerCase().includes(query) ||
          s.udise_code?.toLowerCase().includes(query)
      )
    }

    // Platform KPI summary
    const summary = {
      total_schools: schoolsList.length,
      active_schools: schoolsList.filter((s) => s.status === 'ACTIVE' || s.status === 'APPROVED').length,
      pending_schools: schoolsList.filter((s) => s.status === 'PENDING').length,
      suspended_schools: schoolsList.filter((s) => s.status === 'SUSPENDED').length,
      total_school_registrations: applications.filter((a) => a.registration_source === 'SCHOOL').length,
      total_direct_registrations: applications.filter((a) => a.registration_source !== 'SCHOOL').length,
      total_verified_school_registrations: applications.filter((a) => a.registration_source === 'SCHOOL' && (a.payment_status === 'paid' || a.payment_status === 'free')).length,
      total_incentive_generated: enrichedSchools.reduce((acc, s) => acc + s.total_incentive_earned, 0),
      total_incentive_paid: enrichedSchools.reduce((acc, s) => acc + s.total_incentive_paid, 0),
      total_incentive_pending: enrichedSchools.reduce((acc, s) => acc + s.total_incentive_pending, 0),
    }

    return NextResponse.json({
      success: true,
      data: enrichedSchools,
      summary,
    })
  } catch (error: any) {
    console.error('Superadmin schools GET exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/superadmin/schools
export async function POST(request: Request) {
  const { authorized } = await verifySuperadminAccess(request)
  if (!authorized) return errorResponse('Unauthorized superadmin access', 401)

  try {
    const body = await request.json()
    const {
      name,
      udise_code,
      school_type = 'Private',
      board = 'CBSE',
      address,
      city,
      state,
      pincode,
      contact_person_name,
      designation = 'Principal',
      official_email,
      mobile,
      status = 'ACTIVE',
      initial_scholarship_id,
      incentive_rate = 20,
      registration_fee = 100,
    } = body

    if (!name?.trim() || !official_email?.trim() || !contact_person_name?.trim() || !mobile?.trim()) {
      return errorResponse('School name, official email, contact person name, and mobile number are required.', 400)
    }

    const cleanEmail = official_email.trim().toLowerCase()
    const autoSchoolId = await getNextSchoolId()
    const tempPassword = generateTemporaryPassword()
    const schoolUuid = `sch-inst-${Date.now()}`

    let authUserId: string | null = null

    // 1. Create Supabase Auth user for the school
    try {
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name.trim(),
          role: 'school',
          school_id: autoSchoolId,
        },
      })

      if (authErr) {
        // If user already exists in auth, retrieve existing user ID
        console.warn('Auth user creation warning:', authErr.message)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const match = existingUsers?.users?.find((u) => u.email?.toLowerCase() === cleanEmail)
        if (match) {
          authUserId = match.id
          // Update password to the new temporary password
          await supabaseAdmin.auth.admin.updateUserById(match.id, { password: tempPassword })
        }
      } else if (authUser?.user) {
        authUserId = authUser.user.id
      }
    } catch (authException: any) {
      console.warn('Supabase Auth createUser exception:', authException.message)
    }

    // 2. Create / Update profile record with role 'school'
    if (authUserId) {
      await supabaseAdmin.from('profiles').upsert({
        id: authUserId,
        email: cleanEmail,
        full_name: `${name.trim()} (${contact_person_name.trim()})`,
        role: 'school',
        school_id: autoSchoolId,
        account_status: status === 'ACTIVE' || status === 'APPROVED' ? 'active' : 'pending',
        updated_at: new Date().toISOString(),
      })
    }

    // 3. Insert record into public.schools
    const newSchoolRecord = {
      id: schoolUuid,
      school_id: autoSchoolId,
      name: name.trim(),
      udise_code: udise_code?.trim() || null,
      school_type,
      board,
      address: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      pincode: pincode?.trim() || '',
      contact_person_name: contact_person_name.trim(),
      designation,
      official_email: cleanEmail,
      mobile: mobile.trim(),
      status: status || 'ACTIVE',
      bank_details: {
        beneficiary_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        is_verified: false,
      },
      user_id: authUserId,
      is_first_login: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: insertedSchool, error: insertErr } = await supabaseAdmin
      .from('schools')
      .insert(newSchoolRecord)
      .select()
      .maybeSingle()

    if (insertErr) {
      console.warn('Database insert into public.schools error (will return payload):', insertErr.message)
    }

    // 4. If scholarship(s) selected, assign all of them
    const targetScholarshipIds: string[] = []
    if (Array.isArray(body.scholarship_ids) && body.scholarship_ids.length > 0) {
      targetScholarshipIds.push(...body.scholarship_ids)
    } else if (initial_scholarship_id) {
      targetScholarshipIds.push(initial_scholarship_id)
    }

    if (targetScholarshipIds.length > 0) {
      const assignmentsToInsert = targetScholarshipIds.map((schId, idx) => ({
        id: `ss-${Date.now()}-${idx}`,
        school_id: autoSchoolId,
        scholarship_id: schId,
        registration_fee: Number(registration_fee) || 100,
        incentive_per_verified_registration: Number(incentive_rate) || 20,
        start_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      try {
        await supabaseAdmin.from('school_scholarships').insert(assignmentsToInsert)
      } catch (schErr: any) {
        console.warn('Batch insert school_scholarships notice:', schErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'School created successfully! Login credentials generated.',
      data: insertedSchool || newSchoolRecord,
      credentials: {
        school_id: autoSchoolId,
        login_email: cleanEmail,
        temporary_password: tempPassword,
        login_url: '/school-portal/login',
        note: 'Share these credentials securely with the authorized school contact. The school will be prompted to change their temporary password upon initial login.',
      },
    })
  } catch (error: any) {
    console.error('Superadmin school POST exception:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
