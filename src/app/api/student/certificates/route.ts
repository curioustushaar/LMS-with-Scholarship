import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/student/certificates
 * Get certificates for the current logged-in student
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    try {
        const userId = authResult.id

        const { data: certificates, error } = await supabase
            .from('certificates')
            .select('*, courses(title, description, image_url)')
            .eq('user_id', userId)
            .order('issued_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({
            success: true,
            data: certificates
        })

    } catch (error: any) {
        console.error('Student certificates fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
