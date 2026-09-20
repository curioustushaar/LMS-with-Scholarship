import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/certificates/pending
 * Get students who completed course but don't have certificates
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const course_id = searchParams.get('course_id')

    // This is a complex query - we need to find students who:
    // 1. Completed all course requirements
    // 2. Don't have a certificate yet
    
    // For now, return students who submitted projects for a course but don't have certificates
    let query = supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')

    if (course_id) {
      query = query.eq('course_id', course_id)
    }

    const { data: approvedProjects, error: projectError } = await query

    if (projectError) {
      return NextResponse.json(
        { error: 'Failed to fetch approved projects', details: projectError.message },
        { status: 500 }
      )
    }

    // Filter out students who already have certificates
    const pendingList = []
    
    for (const project of approvedProjects || []) {
      const { data: certificate } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', project.user_id)
        .eq('course_id', project.course_id)
        .single()

      if (!certificate) {
        pendingList.push({
          user_id: project.user_id,
          course_id: project.course_id,
          user: project.users,
          course: project.courses
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: pendingList,
      count: pendingList.length,
      message: 'Students eligible for certificates'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
