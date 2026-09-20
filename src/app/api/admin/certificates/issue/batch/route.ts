import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/certificates/issue
 * Batch issue certificates to students
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const body = await request.json()
        const { course_id, domain, student_ids, issue_type, send_email } = body

        if (!course_id || !domain || !student_ids || !Array.isArray(student_ids)) {
            return NextResponse.json(
                { error: 'Missing required fields: course_id, domain, student_ids' },
                { status: 400 }
            )
        }

        // If admin (not superadmin), verify access to this course
        if (authResult.role === 'admin') {
            const { data: assignment } = await supabase
                .from('admin_course_assignments')
                .select('course_id')
                .eq('admin_id', authResult.id)
                .eq('course_id', course_id)
                .single()

            if (!assignment) {
                return NextResponse.json(
                    { error: 'Access denied to this course' },
                    { status: 403 }
                )
            }
        }

        const results = {
            processed: 0,
            already_issued: 0,
            errors: 0,
            details: [] as any[]
        }

        // Process each student
        const certificatesToInsert = []

        for (const studentId of student_ids) {
            // 1. Double check if already issued
            const { data: existing } = await supabase
                .from('certificates')
                .select('id')
                .eq('user_id', studentId)
                .eq('course_id', course_id)
                .single()

            if (existing) {
                results.already_issued++
                continue
            }

            // 2. Generate Unique Certificate ID
            const timestamp = Date.now().toString().slice(-6)
            const random = Math.random().toString(36).substring(2, 5).toUpperCase()
            const domainCode = domain.substring(0, 3).toUpperCase()
            const certId = `LMS-${domainCode}-${timestamp}-${random}`

            certificatesToInsert.push({
                user_id: studentId,
                course_id: course_id,
                certificate_number: certId,
                domain: domain,
                sent_status: send_email ? 'sent' : 'pending',
                certificate_url: `${process.env.NEXT_PUBLIC_APP_URL}/certificate/${certId}`, // Real URL
                issued_at: new Date().toISOString()
            })
        }

        if (certificatesToInsert.length > 0) {
            // Use supabaseAdmin (Service Role) to bypass RLS
            const { data, error } = await supabaseAdmin
                .from('certificates')
                .insert(certificatesToInsert)
                .select()

            if (error) {
                console.error('Batch insert error:', error)
                return NextResponse.json(
                    { error: 'Failed to issue certificates', details: error.message },
                    { status: 500 }
                )
            }
            results.processed = data.length
        }

        return NextResponse.json({
            success: true,
            data: results,
            message: `Batch processing complete. ${results.processed} certificates issued.`
        })

    } catch (error: any) {
        console.error('Batch issuance error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
