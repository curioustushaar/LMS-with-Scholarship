import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, getAllowedCourseIds } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

        // If admin or school partner (not superadmin), verify access to this course
        if (authResult.role === 'admin' || authResult.role === 'school') {
            const allowedCourseIds = await getAllowedCourseIds(authResult)
            if (allowedCourseIds.length > 0 && !allowedCourseIds.includes(courseId)) {
                return NextResponse.json(
                    { error: 'Access denied to this course' },
                    { status: 403 }
                )
            }
        }

        // 1. Get all videos in this course
        const { data: courseVideos, error: videosError } = await supabase
            .from('videos')
            .select('id, week_id, weeks!inner(course_id)')
            .eq('weeks.course_id', courseId)

        if (videosError) throw videosError
        const totalVideoCount = courseVideos?.length || 0
        
        // 2. Get all tasks in this course
        const { data: courseTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id')
            .eq('course_id', courseId)
        
        if (tasksError) throw tasksError
        const totalTaskCount = courseTasks?.length || 0
        
        // 3. Get all projects for this course
        const { data: courseProjects, error: projectsError } = await supabase
            .from('projects')
            .select('id')
            .eq('course_id', courseId)
        
        if (projectsError) throw projectsError
        const totalProjectCount = courseProjects?.length || 0

        // 4. Get all students who have video progress in this course
        const { data: videoProgress, error: progressError } = await supabase
            .from('video_progress')
            .select('user_id, completed, video_id, profiles(id, full_name, email)')
            .in('video_id', courseVideos?.map(v => v.id) || [])

        if (progressError) throw progressError
        
        // 5. Get all task submissions for this course
        const { data: taskSubmissions, error: taskSubError } = await supabase
            .from('task_submissions')
            .select('user_id, task_id, status, tasks!inner(course_id)')
            .eq('tasks.course_id', courseId)
            .in('status', ['approved', 'reviewed'])
        
        if (taskSubError) throw taskSubError
        
        // 6. Get all approved projects for this course
        const { data: projectSubmissions, error: projSubError } = await supabase
            .from('projects')
            .select('user_id, id, status')
            .eq('course_id', courseId)
            .eq('status', 'approved')
        
        if (projSubError) throw projSubError

        // 7. Get already issued certificates for this course
        const { data: existingCerts, error: certsError } = await supabase
            .from('certificates')
            .select('user_id')
            .eq('course_id', courseId)

        if (certsError) throw certsError
        const issuedStudentIds = new Set(existingCerts.map(c => c.user_id))

        // 8. Calculate eligibility per student
        const studentStats: Record<string, {
            id: string,
            full_name: string,
            email: string,
            completedVideos: number,
            completedTasks: number,
            completedProjects: number
        }> = {}
        
        // First, collect all unique user IDs
        const allUserIds = new Set<string>()
        videoProgress.forEach(p => allUserIds.add(p.user_id))
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
        videoProgress.forEach(p => {
            if (studentStats[p.user_id] && p.completed) {
                studentStats[p.user_id].completedVideos++
            }
        })
        
        // Count task completions
        if (taskSubmissions) {
            taskSubmissions.forEach(t => {
                if (studentStats[t.user_id]) {
                    studentStats[t.user_id].completedTasks++
                }
            })
        }
        
        // Count project completions
        if (projectSubmissions) {
            projectSubmissions.forEach(proj => {
                if (studentStats[proj.user_id]) {
                    studentStats[proj.user_id].completedProjects++
                }
            })
        }

        // 9. Filter for fully completed and not already issued
        const eligibleStudents = Object.values(studentStats).filter(s => {
            const videosComplete = totalVideoCount === 0 || s.completedVideos >= totalVideoCount
            const tasksComplete = totalTaskCount === 0 || s.completedTasks >= totalTaskCount
            const projectsComplete = totalProjectCount === 0 || s.completedProjects >= totalProjectCount
            
            return videosComplete && tasksComplete && projectsComplete && !issuedStudentIds.has(s.id)
        })

        return NextResponse.json({
            success: true,
            data: eligibleStudents,
            total_videos_required: totalVideoCount,
            total_tasks_required: totalTaskCount,
            total_projects_required: totalProjectCount,
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
