import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

/**
 * GET /api/admin/certificates/eligible/all
 * Fetch ALL students eligible for certificates across ALL courses
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request)
    if (authResult instanceof Response) return authResult

    try {
        // 1. Get all courses
        const { data: courses } = await supabase
            .from('courses')
            .select('id, title')

        if (!courses || courses.length === 0) {
            return NextResponse.json({
                success: true,
                data: { courses: [], total_eligible: 0, courses_with_eligible: 0 }
            })
        }

        // 2. For each course, calculate eligible students
        const eligibilityByCourse = []

        for (const course of courses) {
            // Get all videos in this course
            const { data: courseVideos } = await supabase
                .from('videos')
                .select('id, week_id, weeks!inner(course_id)')
                .eq('weeks.course_id', course.id)

            const totalVideoCount = courseVideos?.length || 0
            if (totalVideoCount === 0 || !courseVideos) continue

            // Get all progress for this course
            const { data: progress } = await supabase
                .from('video_progress')
                .select('user_id, completed, video_id, profiles(id, full_name, email)')
                .in('video_id', courseVideos!.map(v => v.id))

            // Get already issued certificates
            const { data: existingCerts } = await supabase
                .from('certificates')
                .select('user_id')
                .eq('course_id', course.id)

            const issuedStudentIds = new Set((existingCerts ||  []).map(c => c.user_id))

            // Calculate completion per student
            const studentStats: any = {}

            if (progress) {
                for (const p of progress) {
                    const profile: any = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles

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
                }
            }

            // Filter for eligible
            const eligibleStudents = Object.values(studentStats).filter((s: any) =>
                s.completedCount === totalVideoCount && !issuedStudentIds.has(s.id)
            )

            if (eligibleStudents.length > 0) {
                eligibilityByCourse.push({
                    course_id: course.id,
                    course_title: course.title,
                    total_videos: totalVideoCount,
                    eligible_students: eligibleStudents,
                    eligible_count: eligibleStudents.length
                })
            }
        }

        const totalEligible = eligibilityByCourse.reduce((sum, c) => sum + c.eligible_count, 0)

        return NextResponse.json({
            success: true,
            data: {
                courses: eligibilityByCourse,
                total_eligible: totalEligible,
                courses_with_eligible: eligibilityByCourse.length
            }
        })

    } catch (error: any) {
        console.error('All eligible students fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}
