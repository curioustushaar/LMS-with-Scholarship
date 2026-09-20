import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/projects
 * Get all projects with optional filters
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const user_id = searchParams.get('user_id')
    const course_id = searchParams.get('course_id')

    console.log('📥 Fetching projects with filters:', { status, user_id, course_id, role: authResult.role })

    // For admins, only show projects from students in assigned courses
    let allowedStudentIds: string[] = []
    if (authResult.role === 'admin') {
      // Get admin's assigned courses
      const { data: assignments } = await supabaseAdmin
        .from('admin_course_assignments')
        .select('course_id')
        .eq('admin_id', authResult.id)

      const courseIds = assignments?.map(a => a.course_id) || []

      if (courseIds.length > 0) {
        // Get students enrolled in these courses
        const { data: enrollments } = await supabaseAdmin
          .from('enrollments')
          .select('user_id')
          .in('course_id', courseIds)

        allowedStudentIds = Array.from(new Set(enrollments?.map(e => e.user_id) || []))
      }

      console.log(`👥 Admin can see projects from ${allowedStudentIds.length} students`)

      if (allowedStudentIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0
        })
      }
    }

    // First try simple query without joins
    let query = supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by allowed students for admin
    if (authResult.role === 'admin' && allowedStudentIds.length > 0) {
      query = query.in('user_id', allowedStudentIds)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (course_id) {
      query = query.eq('course_id', course_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${data?.length || 0} projects`)

    // Try to fetch user and course data separately for each project
    const enrichedData = []
    
    for (const project of data || []) {
      const enrichedProject = { ...project }
      
      // Get user data
      if (project.user_id) {
        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', project.user_id)
          .single()
        
        if (userData) {
          enrichedProject.users = userData
        }
      }
      
      // Get course data
      if (project.course_id) {
        const { data: courseData } = await supabaseAdmin
          .from('courses')
          .select('id, title')
          .eq('id', project.course_id)
          .single()
        
        if (courseData) {
          enrichedProject.courses = courseData
        }
      }
      
      // Get deliverables
      const { data: deliverables } = await supabaseAdmin
        .from('project_deliverables')
        .select('*')
        .eq('project_id', project.id)
      
      if (deliverables) {
        enrichedProject.project_deliverables = deliverables
      }
      
      // Debug logging
      console.log(`📊 Project ${project.id} enriched data:`, {
        title: enrichedProject.title,
        github_url: enrichedProject.github_url,
        project_url: enrichedProject.project_url,
        deliverables_count: deliverables?.length || 0
      })
      
      // Log deliverables data
      if (deliverables && deliverables.length > 0) {
        console.log(`  📦 Deliverables for project ${project.id}:`)
        deliverables.forEach((d: any, i: number) => {
          console.log(`    ${i + 1}:`, {
            id: d.id,
            github_url: d.github_url || 'null',
            deploy_url: d.deploy_url || 'null',
            file_url: d.file_url || 'null',
            external_link: d.external_link || 'null'
          })
        })
      }
      
      enrichedData.push(enrichedProject)
    }

    return NextResponse.json({
      success: true,
      data: enrichedData,
      count: enrichedData?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/projects
 * Create new project
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    console.log('📝 Creating project with data:', {
      title: body.title,
      course_id: body.course_id,
      user_id: body.user_id
    })

    const { title, description, course_id, user_id, deadline } = body

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required', success: false },
        { status: 400 }
      )
    }

    if (!course_id) {
      return NextResponse.json(
        { error: 'Course is required', success: false },
        { status: 400 }
      )
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'Student is required', success: false },
        { status: 400 }
      )
    }

    const projectData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      course_id,
      user_id,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: 'in_progress'
    }

    console.log('🔄 Inserting project into database:', projectData)

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([projectData])
      .select('*')
      .single()

    if (error) {
      console.error('❌ Database insert error:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        {
          error: 'Failed to create project',
          details: error.message,
          success: false
        },
        { status: 500 }
      )
    }

    console.log('✅ Project created successfully:', data.id)

    return NextResponse.json({
      success: true,
      data,
      message: 'Project created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Unexpected error in POST /projects:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        success: false
      },
      { status: 500 }
    )
  }
}
