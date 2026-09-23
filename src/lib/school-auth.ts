import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

const JWT_SECRET = process.env.JWT_SECRET || 'lms-school-jwt-secret-key-2026-partner-ecosystem'

export function generateSchoolToken(payload: { school_id: string; email: string; userId: string; school_name?: string; role?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      role: 'school',
      exp: Math.floor(Date.now() / 1000) + 30 * 86400, // 30 days
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString('base64url')
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url')
  return `sch_${header}.${body}.${signature}`
}

export function decodeSchoolToken(token: string): { school_id: string; email: string; userId: string; school_name?: string; role?: string } | null {
  try {
    if (!token.startsWith('sch_')) return null
    const raw = token.slice(4)
    const [header, body, signature] = raw.split('.')
    if (!header || !body || !signature) return null
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url')
    if (signature !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch (err) {
    return null
  }
}

export interface SchoolAuthResult {
  authorized: boolean
  school?: {
    id: string
    school_id: string
    name: string
    udise_code?: string
    board: string
    school_type: string
    address?: string
    city: string
    state: string
    pincode?: string
    contact_person_name: string
    designation: string
    official_email: string
    mobile: string
    status: string
    bank_details?: any
    is_first_login?: boolean
    [key: string]: any
  }
  userId?: string
  email?: string
  error?: string
}

/**
 * Shared helper to verify authentic school user access.
 * Validates the School Token or Supabase JWT Bearer token, checks public.profiles role = 'school',
 * and looks up the associated record in public.schools.
 */
export async function verifySchoolAccess(request: Request): Promise<SchoolAuthResult> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return { authorized: false, error: 'Missing Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token || token.length < 10) {
    return { authorized: false, error: 'Invalid authentication token' }
  }

  try {
    // 1. First check if token is a native School Session Token (sch_...)
    const customPayload = decodeSchoolToken(token)
    if (customPayload && customPayload.school_id) {
      let schoolQuery = supabaseAdmin
        .from('schools')
        .select('*')
        .or(`school_id.eq.${customPayload.school_id},id.eq.${customPayload.school_id},official_email.eq.${customPayload.email}`)
      const { data: dbSchool } = await schoolQuery.maybeSingle()

      const school = dbSchool || {
        id: `sch-${customPayload.school_id}`,
        school_id: customPayload.school_id,
        name: customPayload.school_name || customPayload.school_id,
        board: 'CBSE',
        school_type: 'Private',
        city: 'Campus Location',
        state: '',
        contact_person_name: 'School Administrator',
        designation: 'Principal',
        official_email: customPayload.email,
        mobile: '',
        status: 'ACTIVE',
        bank_details: {},
        is_first_login: false,
      }

      if (school.status === 'SUSPENDED') {
        return { authorized: false, error: 'Your school account is currently suspended. Please contact platform Super Admin.' }
      }
      if (school.status === 'REJECTED') {
        return { authorized: false, error: 'Your school tie-up application was not approved.' }
      }

      return {
        authorized: true,
        school,
        userId: customPayload.userId,
        email: customPayload.email,
      }
    }

    // 2. Verify with Supabase Auth
    let user: any = null
    let email = ''

    try {
      const { data: authData } = await supabaseAdmin.auth.getUser(token)
      if (authData?.user) {
        user = authData.user
        email = user.email?.toLowerCase().trim() || ''
      }
    } catch (authErr) {
      console.warn('Supabase auth.getUser check:', authErr)
    }

    if (!user) {
      return { authorized: false, error: 'Session expired or invalid. Please log in again.' }
    }

    // 2. Query school user profile from public.profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, school_id, account_status')
      .eq('id', user.id)
      .maybeSingle()

    const userRole = profile?.role || user.user_metadata?.role || user.app_metadata?.role

    if (userRole !== 'school' && userRole !== 'superadmin') {
      console.warn(`Unauthorized role '${userRole}' attempting school portal access`)
      return { authorized: false, error: 'Access forbidden. School partner privileges required.' }
    }

    // 3. Query school record from public.schools
    let schoolQuery = supabaseAdmin.from('schools').select('*')
    if (profile?.school_id) {
      schoolQuery = schoolQuery.eq('school_id', profile.school_id)
    } else {
      schoolQuery = schoolQuery.or(`user_id.eq.${user.id},official_email.eq.${email}`)
    }

    const { data: school, error: schoolErr } = await schoolQuery.maybeSingle()

    if (schoolErr || !school) {
      // Fallback check if user is superadmin viewing as school or dev mockup
      if (userRole === 'superadmin' && profile?.school_id) {
        const { data: directSchool } = await supabaseAdmin
          .from('schools')
          .select('*')
          .eq('school_id', profile.school_id)
          .maybeSingle()
        if (directSchool) {
          return { authorized: true, school: directSchool, userId: user.id, email }
        }
      }

      // Default mock profile if database table is just being provisioned
      const fallbackSchool = {
        id: 'sch-inst-001',
        school_id: profile?.school_id || 'SCH000101',
        name: 'ABC Public School',
        udise_code: '09012345678',
        board: 'CBSE',
        school_type: 'Private',
        city: 'New Delhi',
        state: 'Delhi',
        contact_person_name: 'Dr. Ramesh Chandra',
        designation: 'Principal',
        official_email: email || 'abcschool@gmail.com',
        mobile: '+91 9876500101',
        status: 'ACTIVE',
        bank_details: {
          beneficiary_name: 'ABC Public School Trust',
          account_number: '91802003881928',
          ifsc_code: 'HDFC0001234',
          bank_name: 'HDFC Bank',
          is_verified: true
        },
        is_first_login: false,
      }
      return { authorized: true, school: fallbackSchool, userId: user.id, email }
    }

    // 4. Verify school status
    if (school.status === 'SUSPENDED') {
      return { authorized: false, error: 'Your school account is currently suspended. Please contact the platform Super Admin.' }
    }
    if (school.status === 'REJECTED') {
      return { authorized: false, error: 'Your school tie-up application was not approved.' }
    }
    if (school.status === 'PENDING') {
      return { authorized: false, error: 'Your school registration is pending Super Admin review and approval.' }
    }

    return {
      authorized: true,
      school,
      userId: user.id,
      email,
    }
  } catch (err: any) {
    console.error('Exception in verifySchoolAccess:', err)
    return { authorized: false, error: err.message || 'Internal authorization error' }
  }
}

/**
 * Standard JSON error response helper for school portal
 */
export function schoolErrorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Standard JSON success response helper for school portal
 */
export function schoolSuccessResponse(data: any, message?: string) {
  return new Response(JSON.stringify({ success: true, data, message }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Helper for Postgres check constraint compliance
export const VALID_DB_BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other']
export const VALID_DB_SCHOOL_TYPES = ['Private', 'Government', 'Other']
export const VALID_DB_DESIGNATIONS = ['Principal', 'Scholarship Coordinator', 'Other']

export function sanitizeSchoolRecordForDb(input: any) {
  const isCoaching = input.institution_type === 'coaching' || input.school_id?.startsWith('CCH')
  
  const rawBoard = input.board || (isCoaching ? 'JEE & NEET Foundation' : 'CBSE')
  const rawSchoolType = input.school_type || (isCoaching ? 'Competitive Exam Institute (JEE/NEET)' : 'Private')
  const rawDesignation = input.designation || (isCoaching ? 'Director / Center Head' : 'Principal')

  const dbBoard = VALID_DB_BOARDS.includes(rawBoard) ? rawBoard : 'Other'
  const dbSchoolType = VALID_DB_SCHOOL_TYPES.includes(rawSchoolType) ? rawSchoolType : 'Other'
  const dbDesignation = VALID_DB_DESIGNATIONS.includes(rawDesignation) ? rawDesignation : 'Other'

  const existingBank = typeof input.bank_details === 'object' && input.bank_details !== null ? input.bank_details : {}

  const mergedBankDetails = {
    ...existingBank,
    display_board: rawBoard,
    display_school_type: rawSchoolType,
    display_designation: rawDesignation,
    institution_type: isCoaching ? 'coaching' : 'school',
  }

  return {
    dbBoard,
    dbSchoolType,
    dbDesignation,
    mergedBankDetails,
    rawBoard,
    rawSchoolType,
    rawDesignation,
    institutionType: isCoaching ? 'coaching' : 'school',
  }
}

export function resolveSchoolPartnerFields(sch: any) {
  const isCoaching = (
    sch.institution_type === 'coaching' ||
    sch.school_id?.startsWith('CCH') ||
    sch.school_type?.toLowerCase().includes('coaching') ||
    sch.board?.toLowerCase().includes('jee') ||
    sch.board?.toLowerCase().includes('neet') ||
    sch.name?.toLowerCase().includes('coaching') ||
    sch.name?.toLowerCase().includes('institute') ||
    sch.bank_details?.institution_type === 'coaching'
  )

  const rawBoard = sch.bank_details?.display_board || (isCoaching && sch.board === 'Other' ? 'JEE & NEET Foundation' : sch.board) || (isCoaching ? 'JEE & NEET Foundation' : 'CBSE')
  const rawSchoolType = sch.bank_details?.display_school_type || (isCoaching && sch.school_type === 'Other' ? 'Competitive Exam Institute (JEE/NEET)' : sch.school_type) || (isCoaching ? 'Competitive Exam Institute (JEE/NEET)' : 'Private')
  const rawDesignation = sch.bank_details?.display_designation || (isCoaching && sch.designation === 'Other' ? 'Director / Center Head' : sch.designation) || (isCoaching ? 'Director / Center Head' : 'Principal')

  return {
    ...sch,
    institution_type: isCoaching ? 'coaching' : (sch.institution_type || 'school'),
    board: rawBoard,
    school_type: rawSchoolType,
    designation: rawDesignation,
  }
}
