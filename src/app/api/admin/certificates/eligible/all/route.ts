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
            
            // Get all tasks for this course
            const { data: courseTasks } = await supabase
                .from('tasks')
                .select('id')
                .eq('course_id', course.id)
            
            const totalTaskCount = courseTasks?.length || 0
            
            // Get all projects for this course  
            const { data: courseProjects } = await supabase
                .from('projects')
                .select('id')
                .eq('course_id', course.id)
            
            const totalProjectCount = courseProjects?.length || 0

            // Skip if course has no content requirements
            if (totalVideoCount === 0 && totalTaskCount === 0 && totalProjectCount === 0) continue

            // Get all video progress for this course
            const { data: videoProgress } = await supabase
                .from('video_progress')
                .select('user_id, completed, video_id, profiles(id, full_name, email)')
                .in('video_id', courseVideos?.map(v => v.id) || [])
            
            // Get all task submissions for this course
            const { data: taskSubmissions } = await supabase
                .from('task_submissions')
                .select('user_id, task_id, status, tasks!inner(course_id)')
                .eq('tasks.course_id', course.id)
                .in('status', ['approved', 'reviewed'])
            
            // Get all project submissions for this course
            const { data: projectSubmissions } = await supabase
                .from('projects')
                .select('user_id, id, status')
                .eq('course_id', course.id)
                .eq('status', 'approved')

            // Get already issued certificates
            const { data: existingCerts } = await supabase
                .from('certificates')
                .select('user_id')
                .eq('course_id', course.id)

            const issuedStudentIds = new Set((existingCerts ||  []).map(c => c.user_id))

            // Calculate completion per student
            const studentStats: any = {}
            
            // First, get all enrolled students to get their profile information
            const allUserIds = new Set<string>()
            if (videoProgress) videoProgress.forEach(p => allUserIds.add(p.user_id))
            if (taskSubmissions) taskSubmissions.forEach(t => allUserIds.add(t.user_id))
            if (projectSubmissions) projectSubmissions.forEach(p => allUserIds.add(p.user_id))
            
            // Get profile data for all users
            if (allUserIds.size > 0) {
                const { data: userProfiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', Array.from(allUserIds))
                
                if (userProfiles) {
                    userProfiles.forEach(profile => {
                        studentStats[profile.id] = {
                            id: profile.id,
                            full_name: profile.full_name || 'Unknown',
                            email: profile.email || 'N/A',
                            completedVideos: 0,
                            completedTasks: 0,
                            completedProjects: 0
                        }
                    })
                }
            }

            // Count video completions
            if (videoProgress) {
                for (const p of videoProgress) {
                    if (studentStats[p.user_id] && p.completed) {
                        studentStats[p.user_id].completedVideos++
                    }
                }
            }
            
            // Count task completions
            if (taskSubmissions) {
                for (const t of taskSubmissions) {
                    if (studentStats[t.user_id]) {
                        studentStats[t.user_id].completedTasks++
                    }
                }
            }
            
            // Count project completions
            if (projectSubmissions) {
                for (const proj of projectSubmissions) {
                    if (studentStats[proj.user_id]) {
                        studentStats[proj.user_id].completedProjects++
                    }
                }
            }

            // Filter for eligible - must complete ALL requirements
            const eligibleStudents = Object.values(studentStats).filter((s: any) => {
                const videosComplete = totalVideoCount === 0 || s.completedVideos >= totalVideoCount
                const tasksComplete = totalTaskCount === 0 || s.completedTasks >= totalTaskCount
                const projectsComplete = totalProjectCount === 0 || s.completedProjects >= totalProjectCount
                
                return videosComplete && tasksComplete && projectsComplete && !issuedStudentIds.has(s.id)
            })

            if (eligibleStudents.length > 0) {
                eligibilityByCourse.push({
                    course_id: course.id,
                    course_title: course.title,
                    total_videos: totalVideoCount,
                    total_tasks: totalTaskCount,
                    total_projects: totalProjectCount,
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
