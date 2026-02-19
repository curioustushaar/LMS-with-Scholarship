import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * PATCH /api/admin/badges/[id]
 * Update a badge
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const id = params.id
        const body = await request.json()
        const { name, description, icon_url, category, rule_type, rule_value, rule_duration } = body

        const updateData: any = {}
        if (name) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (icon_url !== undefined) updateData.icon_url = icon_url
        if (category) updateData.category = category
        if (rule_type) updateData.rule_type = rule_type
        if (rule_value !== undefined) updateData.rule_value = parseInt(rule_value)
        if (rule_duration !== undefined) updateData.rule_duration = rule_duration ? parseInt(rule_duration) : null

        const { data, error } = await supabase
            .from('badges')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json(
                { error: 'Failed to update badge', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data,
            message: 'Badge updated successfully'
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/badges/[id]
 * Delete a badge
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const id = params.id

        const { error } = await supabase
            .from('badges')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json(
                { error: 'Failed to delete badge', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Badge deleted successfully'
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
