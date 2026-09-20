import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/projects/:id
 * Get single project with related data
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { id } = params

        console.log('📥 Fetching project:', { projectId: id })

        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('❌ Database error fetching project:', error.message)
            return NextResponse.json(
                { success: false, error: 'Project not found', details: error.message },
                { status: 404 }
            )
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        // If admin (not superadmin), verify access to this project's user
        if (authResult.role === 'admin') {
            // Get admin's assigned courses
            const { data: assignments } = await supabaseAdmin
                .from('admin_course_assignments')
                .select('course_id')
                .eq('admin_id', authResult.id)

            const courseIds = assignments?.map(a => a.course_id) || []

            if (courseIds.length > 0) {
                // Check if project's user is enrolled in any assigned course
                const { data: enrollment } = await supabaseAdmin
                    .from('enrollments')
                    .select('user_id')
                    .eq('user_id', data.user_id)
                    .in('course_id', courseIds)
                    .limit(1)
                    .single()

                if (!enrollment) {
                    return NextResponse.json(
                        { success: false, error: 'Access denied to this project' },
                        { status: 403 }
                    )
                }
            } else {
                return NextResponse.json(
                    { success: false, error: 'No courses assigned to you' },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error: any) {
        console.error('💥 Unexpected error fetching project:', error.message)
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/projects/:id
 * Update project
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { id } = params
        const body = await request.json()

        console.log('📝 Updating project:', { projectId: id, updates: body })

        // First, get the project to check access
        const { data: project } = await supabaseAdmin
            .from('projects')
            .select('user_id')
            .eq('id', id)
            .single()

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        // If admin (not superadmin), verify access to this project's user
        if (authResult.role === 'admin') {
            const { data: assignments } = await supabaseAdmin
                .from('admin_course_assignments')
                .select('course_id')
                .eq('admin_id', authResult.id)

            const courseIds = assignments?.map(a => a.course_id) || []

            if (courseIds.length > 0) {
                const { data: enrollment } = await supabaseAdmin
                    .from('enrollments')
                    .select('user_id')
                    .eq('user_id', project.user_id)
                    .in('course_id', courseIds)
                    .limit(1)
                    .single()

                if (!enrollment) {
                    return NextResponse.json(
                        { success: false, error: 'Access denied to this project' },
                        { status: 403 }
                    )
                }
            }
        }

        const { data, error } = await supabaseAdmin
            .from('projects')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('❌ Database error updating project:', error.message)
            return NextResponse.json(
                { success: false, error: 'Failed to update project', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data,
            message: 'Project updated successfully'
        })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/projects/:id
 * Delete project
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { id } = params

        // First, get the project to check access
        const { data: project } = await supabaseAdmin
            .from('projects')
            .select('user_id')
            .eq('id', id)
            .single()

        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            )
        }

        // If admin (not superadmin), verify access to this project's user
        if (authResult.role === 'admin') {
            const { data: assignments } = await supabaseAdmin
                .from('admin_course_assignments')
                .select('course_id')
                .eq('admin_id', authResult.id)

            const courseIds = assignments?.map(a => a.course_id) || []

            if (courseIds.length > 0) {
                const { data: enrollment } = await supabaseAdmin
                    .from('enrollments')
                    .select('user_id')
                    .eq('user_id', project.user_id)
                    .in('course_id', courseIds)
                    .limit(1)
                    .single()

                if (!enrollment) {
                    return NextResponse.json(
                        { success: false, error: 'Access denied to this project' },
                        { status: 403 }
                    )
                }
            }
        }

        const { error } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete project', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Project deleted successfully'
        })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
