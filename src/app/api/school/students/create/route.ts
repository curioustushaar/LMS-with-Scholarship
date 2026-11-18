import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifySchoolAccess, schoolErrorResponse } from '@/lib/school-auth'
import { sendStudentCredentialsEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/school/students/create
 * School Partner creates a new student with login credentials and enrolls them into selected courses
 */
export async function POST(request: Request) {
  const auth = await verifySchoolAccess(request)
  if (!auth.authorized || !auth.school) {
    return schoolErrorResponse(auth.error || 'Unauthorized school access', 401)
  }

  try {
    const body = await request.json()
    const {
      email,
      full_name,
      phone,
      parents_contact,
      class: studentClass,
      password,
      course_ids = []
    } = body

    if (!email || !full_name) {
      return schoolErrorResponse('Student email and full name are required.', 400)
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = full_name.trim()

    // 1. Check if email already exists in Supabase Auth
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingAuth = authUsers?.users?.find(u => u.email?.toLowerCase() === cleanEmail)
      if (existingAuth) {
        return schoolErrorResponse('A student account with this email address has already been registered.', 409)
      }
    } catch (authListErr) {
      console.warn('⚠️ Auth list check notice:', authListErr)
    }

    // 2. Check if email already exists in profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingProfile) {
      return schoolErrorResponse('A profile with this email address already exists in the system.', 409)
    }

    // 3. Generate or use supplied password
    const studentPassword = password || Math.random().toString(36).slice(-8) + 'A1!'

    // 4. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: studentPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        role: 'student',
        phone: phone || null,
        parents_contact: parents_contact || null,
        class: studentClass || null,
        school_id: auth.school.school_id,
        school_coaching: auth.school.name,
      }
    })

    if (authError || !authData?.user) {
      console.error('❌ Failed to create student auth user:', authError)
      return schoolErrorResponse(authError?.message || 'Failed to create student authentication account.', 500)
    }

    const studentUserId = authData.user.id

    // 5. Create Profile in profiles table
    const profilePayload: any = {
      id: studentUserId,
      email: cleanEmail,
      full_name: cleanName,
      role: 'student',
      account_status: 'active',
      school_id: auth.school.school_id,
      school_coaching: auth.school.name,
      phone: phone || null,
      parents_contact: parents_contact || null,
      class: studentClass || null,
      created_at: new Date().toISOString(),
    }

    let { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload)
      .select()
      .single()

    // Resilient fallback in case some optional columns haven't been migrated in Postgres
    if (profileError && (profileError.message?.includes('column') || profileError.code === '42703')) {
      console.warn('⚠️ Custom columns fallback during student profile creation:', profileError.message)
      const fallbackPayload = {
        id: studentUserId,
        email: cleanEmail,
        full_name: cleanName,
        role: 'student',
        account_status: 'active',
        phone: phone || null,
        created_at: profilePayload.created_at,
      }
      const retry = await supabaseAdmin
        .from('profiles')
        .upsert(fallbackPayload)
        .select()
        .single()
      profileData = retry.data
      profileError = retry.error
    }

    if (profileError) {
      console.error('❌ Database insert error (profiles):', profileError.message)
      // Cleanup auth account to prevent orphaned login
      try {
        await supabaseAdmin.auth.admin.deleteUser(studentUserId)
      } catch (delErr) {
        console.error('Failed to cleanup auth user:', delErr)
      }
      return schoolErrorResponse('Failed to create student profile in database: ' + profileError.message, 500)
    }

    // 6. Enroll student in selected courses
    let enrolledCourses: string[] = []
    if (Array.isArray(course_ids) && course_ids.length > 0) {
      try {
        const enrollPayload = course_ids.map((courseId: string) => ({
          user_id: studentUserId,
          course_id: courseId,
          enrolled_at: new Date().toISOString()
        }))

        const { data: enrollRes, error: enrollErr } = await supabaseAdmin
          .from('enrollments')
          .insert(enrollPayload)
          .select()

        if (enrollErr) {
          console.error('⚠️ Could not insert enrollments:', enrollErr.message)
        } else {
          enrolledCourses = course_ids
          console.log(`✅ Successfully enrolled student in ${course_ids.length} course(s)`)
        }
      } catch (enrollException: any) {
        console.error('⚠️ Enrollment exception:', enrollException.message)
      }
    }

    // 7. Send credentials email (asynchronous in background, doesn't block response)
    sendStudentCredentialsEmail({
      to: cleanEmail,
      student_id: studentUserId,
      student_name: cleanName,
      email: cleanEmail,
      password: studentPassword,
      phone,
      student_class: studentClass,
      school_coaching: auth.school.name
    }).catch(emailErr => {
      console.warn('⚠️ Could not send student credentials email:', emailErr?.message || emailErr)
    })

    return NextResponse.json({
      success: true,
      message: 'Student account created and enrolled successfully!',
      data: {
        id: studentUserId,
        email: cleanEmail,
        full_name: cleanName,
        password: studentPassword,
        phone,
        class: studentClass,
        school_name: auth.school.name,
        school_id: auth.school.school_id,
        enrolled_courses: enrolledCourses
      }
    })
  } catch (err: any) {
    console.error('💥 Error in POST /api/school/students/create:', err)
    return schoolErrorResponse(err.message || 'Internal server error', 500)
  }
}
