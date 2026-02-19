import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/certificates/eligible
 * Fetch students eligible for a certificate in a specific course
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        const { searchParams } = new URL(request.url)
        const courseId = searchParams.get('course_id')

        if (!courseId) {
            return NextResponse.json(
                { error: 'course_id is required' },
                { status: 400 }
            )
        }

        // 1. Get all videos in this course
        const { data: courseVideos, error: videosError } = await supabase
            .from('videos')
            .select('id, week_id, weeks!inner(course_id)')
            .eq('weeks.course_id', courseId)

        if (videosError) throw videosError
        const totalVideoCount = courseVideos?.length || 0

        // 3. Get all students who have any progress in this course
        // Note: Joining with 'profiles' because video_progress references profiles in this DB
        const { data: progress, error: progressError } = await supabase
            .from('video_progress')
            .select('user_id, completed, video_id, profiles(id, full_name, email)')
            .in('video_id', courseVideos.map(v => v.id))

        if (progressError) throw progressError

        // 3. Get already issued certificates for this course
        const { data: existingCerts, error: certsError } = await supabase
            .from('certificates')
            .select('user_id')
            .eq('course_id', courseId)

        if (certsError) throw certsError
        const issuedStudentIds = new Set(existingCerts.map(c => c.user_id))

        // 4. Calculate eligibility per student
        const studentStats: Record<string, {
            id: string,
            full_name: string,
            email: string,
            completedCount: number
        }> = {}

        progress.forEach(p => {
            // Handle profiles relation (it might come as an array or object depending on relationship type, usually object for foreign key)
            const u = p.profiles as any
            // Fallback if profiles is array
            const profile = Array.isArray(u) ? u[0] : u

            if (!studentStats[p.user_id]) {
                studentStats[p.user_id] = {
                    id: p.user_id,
                    full_name: profile?.full_name || 'Unknown',
                    email: profile?.email || 'N/A',
                    completedCount: 0
                }
            }
            if (p.completed) {
                studentStats[p.user_id].completedCount++
            }
        })

        // 5. Filter for fully completed and not already issued
        const eligibleStudents = Object.values(studentStats).filter(s =>
            s.completedCount === totalVideoCount && totalVideoCount > 0 && !issuedStudentIds.has(s.id)
        )

        return NextResponse.json({
            success: true,
            data: eligibleStudents,
            total_videos_required: totalVideoCount,
            count: eligibleStudents.length
        })

    } catch (error: any) {
        console.error('Eligible students fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
