import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/submissions
 * Get all task submissions with student and task info
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        console.log('📥 Fetching submissions with filters:', { status, role: authResult.role })

        // For admins, filter by tasks they created OR students they manage
        let allowedTaskIds: string[] = []
        let allowedStudentIds: string[] = []

        if (authResult.role === 'admin') {
            // Get tasks created by this admin
            const { data: tasks } = await supabaseAdmin
                .from('tasks')
                .select('id')
                .eq('created_by', authResult.id)

            allowedTaskIds = tasks?.map(t => t.id) || []

            // Get students from assigned courses
            const { data: assignments } = await supabaseAdmin
                .from('admin_course_assignments')
                .select('course_id')
                .eq('admin_id', authResult.id)

            const courseIds = assignments?.map(a => a.course_id) || []

            if (courseIds.length > 0) {
                const { data: enrollments } = await supabaseAdmin
                    .from('enrollments')
                    .select('user_id')
                    .in('course_id', courseIds)

                allowedStudentIds = Array.from(new Set(enrollments?.map(e => e.user_id) || []))
            }

            console.log(`🔍 Admin can see submissions: ${allowedTaskIds.length} tasks, ${allowedStudentIds.length} students`)

            // If no tasks or students, return empty
            if (allowedTaskIds.length === 0 && allowedStudentIds.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: [],
                    count: 0
                })
            }
        }

        let query = supabaseAdmin
            .from('task_submissions')
            .select(`
        id,
        task_id,
        user_id,
        submission_url,
        submission_text,
        status,
        submitted_at,
        points_awarded,
        feedback,
        evaluated_at:reviewed_at,
        users:profiles!task_submissions_user_id_fkey(id, full_name, email),
        tasks(id, title, max_points)
      `)
            .order('submitted_at', { ascending: false })

        // Filter by admin's tasks OR students
        if (authResult.role === 'admin') {
            if (allowedTaskIds.length > 0 && allowedStudentIds.length > 0) {
                query = query.or(`task_id.in.(${allowedTaskIds.join(',')}),user_id.in.(${allowedStudentIds.join(',')})`)
            } else if (allowedTaskIds.length > 0) {
                query = query.in('task_id', allowedTaskIds)
            } else if (allowedStudentIds.length > 0) {
                query = query.in('user_id', allowedStudentIds)
            }
        }

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            console.error('❌ Error fetching task submissions:', error.message)
            return NextResponse.json(
                { success: false, error: 'Failed to fetch submissions', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data,
            count: data?.length || 0
        })

    } catch (error: any) {
        console.error('💥 Unexpected error fetching task submissions:', error.message)
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
