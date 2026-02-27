import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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
    const { email, full_name, phone } = body

    console.log('📝 Creating student:', { email, full_name, phone })

    if (!email || !full_name) {
      console.warn('⚠️ Missing required fields:', { email: !!email, full_name: !!full_name })
      return NextResponse.json(
        { error: 'Email and full name are required', success: false },
        { status: 400 }
      )
    }

    // Check if email already exists in Supabase Auth first
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingAuthUser = authUsers?.users?.find(u => u.email === email)
      
      if (existingAuthUser) {
        console.warn('⚠️ Email already exists in Supabase Auth:', email)
        return NextResponse.json(
          { error: 'A user with this email address has already been registered', success: false },
          { status: 409 }
        )
      }
    } catch (authCheckError: any) {
      console.warn('⚠️ Could not check auth users:', authCheckError.message)
    }

    // Check if email already exists in profiles table
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
        phone: phone || null
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
    const studentData: any = {
      id: authUser.user.id,
      email,
      full_name,
      role: 'student',
      account_status: 'active',
      created_by_admin_id: authResult.id  // Track which admin created this student
    }

    // Note: Phone is stored in user_metadata, not in profiles table
    console.log('📤 Inserting student data into profiles table:', studentData)

    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('profiles')
      .upsert(studentData)
      .select()
      .single()

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
    } else if (authResult.role === 'admin') {
      // Auto-enroll in admin's assigned courses
      console.log('📋 No courses provided, fetching admin\'s assigned courses...')
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)
      
      coursesToEnroll = assignments?.map(a => a.course_id) || []
      console.log(`📋 Auto-enrolling in ${coursesToEnroll.length} admin-assigned courses`)
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

    return NextResponse.json({
      success: true,
      data: {
        ...(dbUser || studentData),
        password: password // Return password so admin can see it once
      },
      message: 'Student created successfully with login access'
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
