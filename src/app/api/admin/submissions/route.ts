import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

        let query = supabase
            .from('task_submissions')
            .select(`
        id,
        task_id,
        user_id,
        submission_url,
        submission_text,
        github_url,
        deploy_url,
        project_name,
        submission_file_url,
        submission_description,
        status,
        submitted_at,
        points_awarded,
        feedback,
        evaluated_at,
        users!task_submissions_user_id_fkey(id, full_name, email),
        tasks(id, title, max_points)
      `)
            .order('submitted_at', { ascending: false })

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
