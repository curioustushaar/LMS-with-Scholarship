import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

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
