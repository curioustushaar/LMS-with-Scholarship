import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin API helpers
export const adminAPI = {
  // Students
  getStudents: async (filters?: any) => {
    let query = supabase.from('users').select('*')
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.role) query = query.eq('role', filters.role)
    return await query
  },

  getStudent: async (id: string) => {
    return await supabase.from('users').select('*').eq('id', id).single()
  },

  createStudent: async (data: any) => {
    return await supabase.from('users').insert(data)
  },

  updateStudent: async (id: string, data: any) => {
    return await supabase.from('users').update(data).eq('id', id)
  },

  resetPassword: async (id: string) => {
    // Implement password reset logic
    return { success: true }
  },

  // Courses
  getCourses: async () => {
    return await supabase.from('courses').select('*')
  },

  getCourse: async (id: string) => {
    return await supabase.from('courses').select('*, weeks(*)').eq('id', id).single()
  },

  createCourse: async (data: any) => {
    return await supabase.from('courses').insert(data)
  },

  // Weeks
  getWeeks: async (courseId: string) => {
    return await supabase.from('weeks').select('*, videos(*)').eq('course_id', courseId)
  },

  lockWeek: async (weekId: string, locked: boolean) => {
    return await supabase.from('weeks').update({ locked }).eq('id', weekId)
  },

  // Videos
  getVideos: async (weekId: string) => {
    return await supabase.from('videos').select('*').eq('week_id', weekId)
  },

  createVideo: async (data: any) => {
    return await supabase.from('videos').insert(data)
  },

  // Tasks
  getTasks: async () => {
    return await supabase.from('tasks').select('*')
  },

  getTaskSubmissions: async (taskId: string) => {
    return await supabase.from('task_submissions').select('*, users(*)').eq('task_id', taskId)
  },

  evaluateSubmission: async (submissionId: string, marks: number, feedback: string) => {
    return await supabase.from('task_submissions').update({
      marks,
      feedback,
      status: 'evaluated'
    }).eq('id', submissionId)
  },

  // Projects
  getProjects: async () => {
    return await supabase.from('projects').select('*, users(*), project_milestones(*)')
  },

  approveProject: async (projectId: string) => {
    return await supabase.from('projects').update({ status: 'approved' }).eq('id', projectId)
  },

  updateMilestone: async (milestoneId: string, status: string) => {
    return await supabase.from('project_milestones').update({ status }).eq('id', milestoneId)
  },

  // Badges
  getBadges: async () => {
    return await supabase.from('badges').select('*')
  },

  assignBadge: async (userId: string, badgeId: string) => {
    return await supabase.from('user_badges').insert({ user_id: userId, badge_id: badgeId })
  },

  revokeBadge: async (userId: string, badgeId: string) => {
    return await supabase.from('user_badges').delete().eq('user_id', userId).eq('badge_id', badgeId)
  },

  // Certificates
  getPendingCertificates: async () => {
    return await supabase.from('certificates').select('*, users(*)').eq('status', 'pending')
  },

  issueCertificate: async (userId: string, courseId: string) => {
    return await supabase.from('certificates').insert({
      user_id: userId,
      course_id: courseId,
      status: 'issued',
      issue_date: new Date().toISOString()
    })
  },

  // Support Tickets
  getTickets: async (filters?: any) => {
    let query = supabase.from('tickets').select('*, users(*)')
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.priority) query = query.eq('priority', filters.priority)
    return await query
  },

  getTicketMessages: async (ticketId: string) => {
    return await supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at')
  },

  replyToTicket: async (ticketId: string, message: string, userId: string) => {
    return await supabase.from('ticket_messages').insert({
      ticket_id: ticketId,
      user_id: userId,
      message,
      is_admin: true
    })
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    return await supabase.from('tickets').update({ status }).eq('id', ticketId)
  },

  // Analytics
  getDashboardStats: async () => {
    const [students, tasks, projects, tickets, certificates] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('task_submissions').select('*', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('projects').select('*', { count: 'exact' }).eq('status', 'pending_approval'),
      supabase.from('tickets').select('*', { count: 'exact' }).eq('status', 'open'),
      supabase.from('certificates').select('*', { count: 'exact' }).eq('status', 'issued')
    ])

    return {
      totalStudents: students.count || 0,
      pendingTasks: tasks.count || 0,
      pendingProjects: projects.count || 0,
      openTickets: tickets.count || 0,
      issuedCertificates: certificates.count || 0
    }
  }
}
