import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, getAllowedCourseIds } from '@/lib/auth'
import { sendStudentCredentialsEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/students/create
 * Create new student
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()

    // Validate required fields
    const { email, full_name, phone, parents_contact, class: studentClass, school_coaching } = body

    console.log('📝 Creating student:', { email, full_name, phone, parents_contact, class: studentClass, school_coaching })

    if (!email || !full_name) {
      console.warn('⚠️ Missing required fields:', { email: !!email, full_name: !!full_name })
      return NextResponse.json(
        { error: 'Email and full name are required', success: false },
        { status: 400 }
      )
    }

    // Check if email already exists in profiles table (fast indexed query)
    const { data: existingProfile, error: existError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (existError) {
      console.error('❌ Error checking existing profile:', existError.message)
    }

    if (existingProfile) {
      console.warn('⚠️ Email already exists in profiles:', email)
      return NextResponse.json(
        { error: 'A user with this email address has already been registered', success: false },
        { status: 409 }
      )
    }

    // 1. Create User in Supabase Auth (This enables login)
    const password = body.password || Math.random().toString(36).slice(-10); // Use provided or random password
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { 
        full_name: full_name,
        role: 'student',
        phone: phone || null,
        parents_contact: parents_contact || null,
        class: studentClass || null,
        school_coaching: school_coaching || null
      }
    })

    if (authError) {
      console.error('❌ Supabase Auth creation error:', authError)
      
      // Provide better error messages
      let errorMessage = 'Failed to create authentication account'
      if (authError.message?.includes('already been registered')) {
        errorMessage = 'A user with this email address has already been registered'
      } else if (authError.message) {
        errorMessage = authError.message
      }
      
      return NextResponse.json(
        { error: errorMessage, details: authError.message, success: false },
        { status: 500 }
      )
    }

    console.log('✅ Auth account created:', authUser.user.id)

    // 2. Insert into public.profiles table (Database)
    const assignedSchoolId = authResult.assigned_school_id || authResult.school_id
    const assignedSchoolName = authResult.assigned_school_name
    const studentData: any = {
      id: authUser.user.id,
      email,
      full_name,
      role: 'student',
      account_status: 'active',
      phone: phone || null,
      parents_contact: parents_contact || null,
      class: studentClass || null,
      school_coaching: school_coaching || assignedSchoolName || null,
      school_id: assignedSchoolId || null,
      created_at: new Date().toISOString(), // Explicitly set created_at
      created_by_admin_id: authResult.id  // Track which admin/school created this student
    }

    console.log('📤 Inserting student data into profiles table:', studentData)

    let dbUser: any = null
    let dbError: any = null

    // Try full insert with all new fields
    const insertRes = await supabaseAdmin
      .from('profiles')
      .upsert(studentData, { onConflict: 'id' })
      .select()
      .single()

    dbUser = insertRes.data
    dbError = insertRes.error

    // Resilient fallback if custom columns have not been migrated yet in Postgres
    if (dbError && (dbError.message?.includes('column') || dbError.code === '42703')) {
      console.warn('⚠️ Custom columns may not exist yet in profiles table, attempting fallback:', dbError.message)
      const fallbackData: any = {
        id: authUser.user.id,
        email,
        full_name,
        role: 'student',
        account_status: 'active',
        phone: phone || null,
        created_at: studentData.created_at,
        created_by_admin_id: authResult.id
      }
      const retryRes = await supabaseAdmin
        .from('profiles')
        .upsert(fallbackData)
        .select()
        .single()

      dbUser = retryRes.data
      dbError = retryRes.error

      // If even phone column is not in profiles, try minimal base profile
      if (dbError && (dbError.message?.includes('column') || dbError.code === '42703')) {
        const baseData: any = {
          id: authUser.user.id,
          email,
          full_name,
          role: 'student',
          account_status: 'active',
          created_at: studentData.created_at,
          created_by_admin_id: authResult.id
        }
        const baseRes = await supabaseAdmin
          .from('profiles')
          .upsert(baseData)
          .select()
          .single()

        dbUser = baseRes.data
        dbError = baseRes.error
      }
    }

    if (dbError) {
      console.error('❌ Database insert error (profiles table):', dbError.message)
      
      // If profile insert fails, try to clean up the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        console.log('🧹 Cleaned up auth user after database failure')
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup auth user:', cleanupError)
      }
      
      return NextResponse.json(
        { error: 'Failed to create student profile', details: dbError.message, success: false },
        { status: 500 }
      )
    }

    console.log('✅ Student profile created in database')

    // Determine which courses to enroll the student in
    let coursesToEnroll: string[] = []
    
    if (Array.isArray(body.course_ids) && body.course_ids.length > 0) {
      // Use explicitly provided courses
      coursesToEnroll = body.course_ids
      console.log('📋 Using provided course IDs:', coursesToEnroll)
    } else if (authResult.role === 'admin' || authResult.role === 'school') {
      // Auto-enroll in assigned courses
      console.log('📋 No courses provided, fetching assigned courses...')
      coursesToEnroll = await getAllowedCourseIds(authResult)
      console.log(`📋 Auto-enrolling in ${coursesToEnroll.length} assigned courses`)
    }

    // Enroll student into courses
    if (coursesToEnroll.length > 0) {
      try {
        const enrollPayload = coursesToEnroll.map((courseId: string) => ({
          user_id: authUser.user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString()
        }))

        console.log('📤 Inserting enrollments:', enrollPayload)

        // Insert enrollments
        const { data: enrollData, error: enrollError } = await supabaseAdmin
          .from('enrollments')
          .insert(enrollPayload)
          .select()

        if (enrollError) {
          console.error('❌ Failed to insert enrollments:', enrollError.message, enrollError)
        } else {
          console.log(`✅ Enrolled student in ${enrollData?.length || coursesToEnroll.length} courses:`, enrollData)
        }
      } catch (err: any) {
        console.error('💥 Unexpected error while inserting enrollments:', err.message, err)
      }
    } else {
      console.log('⚠️ No courses to enroll student in')
    }

    // Send login credentials to student email asynchronously in the background
    // (Never block API response - ensures student creation returns instantly)
    console.log('📧 Dispatching credentials email to student:', email, 'ID:', authUser.user.id)
    sendStudentCredentialsEmail({
      to: email,
      student_id: authUser.user.id,
      student_name: full_name,
      email,
      password,
      phone,
      student_class: studentClass,
      school_coaching
    }).then(res => {
      if (res?.success) console.log('✅ Student credentials email sent successfully to:', email)
      else console.warn('⚠️ Student credentials email sending failed:', res?.error)
    }).catch(emailErr => {
      console.error('⚠️ Could not send student credentials email:', emailErr?.message || emailErr)
    })

    return NextResponse.json({
      success: true,
      data: {
        ...(dbUser || studentData),
        phone: phone || (dbUser?.phone ?? null),
        parents_contact: parents_contact || (dbUser?.parents_contact ?? null),
        class: studentClass || (dbUser?.class ?? null),
        school_coaching: school_coaching || (dbUser?.school_coaching ?? null),
        password: password // Return password so admin can see it once
      },
      message: 'Student created successfully with login access and email dispatched'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /students/create:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error.message, success: false },
      { status: 500 }
    )
  }
}
