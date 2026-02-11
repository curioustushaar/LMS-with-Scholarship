/**
 * API Client for Admin operations
 * Handles all backend API calls with proper error handling
 */

import { supabase } from './supabase'

const API_BASE_URL = '/api/admin'

// For now, using a hardcoded user ID
// In production, this should come from auth context/session
const TEMP_ADMIN_ID = 'admin-temp-id'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}

/**
 * Make API request with authentication headers
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get auth token from Supabase session
    let token = null

    if (typeof window !== 'undefined') {
      // Try to get from Supabase session first
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        token = session.access_token
      } else {
        // Fallback to localStorage
        token = localStorage.getItem('supabase.auth.token')
      }
    }

    if (!token) {
      console.warn('⚠️ No auth token found in session or localStorage')
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    console.log(`📤 Sending ${options.method || 'GET'} request to:`, endpoint)

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    let data: any
    try {
      data = await response.json()
    } catch (e) {
      console.error('❌ Failed to parse response JSON:', e)
      throw new Error(`Invalid JSON response from server (${response.status})`)
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status} error`
      console.error(`❌ API Error (${response.status}):`, {
        endpoint,
        method: options.method || 'GET',
        error: errorMessage,
        details: data?.details,
        fullResponse: data
      })

      // Handle unauthorized errors
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token')
          window.location.href = '/login'
        }
      }

      throw new Error(errorMessage)
    }

    console.log(`✅ API Success (${response.status}):`, {
      endpoint,
      method: options.method || 'GET',
      dataLength: JSON.stringify(data).length
    })

    return data
  } catch (error: any) {
    console.error('💥 API Request Failed:', {
      error: error.message,
      endpoint,
      method: options.method || 'GET'
    })
    return {
      success: false,
      error: error.message || 'Something went wrong'
    }
  }
}

// ==========================================
// STUDENTS API
// ==========================================

export const studentsAPI = {
  /**
   * Get all students with optional filters
   */
  getAll: async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/students${query}`)
  },

  /**
   * Get single student by ID
   */
  getById: async (id: string) => {
    return apiRequest(`/students/${id}`)
  },

  /**
   * Get enrollments (courses) for a student
   */
  getEnrollments: async (id: string) => {
    return apiRequest(`/students/${id}/enrollments`)
  },

  /**
   * Create new student
   */
  create: async (data: {
    email: string
    full_name: string
    phone?: string
    password?: string
    course_ids?: string[]
  }) => {
    return apiRequest('/students/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update student
   */
  update: async (id: string, data: Partial<{
    full_name: string
    email: string
    phone: string
    status: string
    profile_image_url: string
  }>) => {
    return apiRequest(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Reset student password
   */
  resetPassword: async (id: string) => {
    return apiRequest(`/students/${id}/reset-password`, {
      method: 'POST',
    })
  },
}

// ==========================================
// COURSES API
// ==========================================

export const coursesAPI = {
  getAll: async (filters?: { status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/courses${query}`)
  },

  getById: async (id: string) => {
    const result = await apiRequest(`/courses/${id}`)
    console.log('getById response:', result)
    return result
  },

  getEnrollments: async (courseId: string) => {
    return apiRequest(`/courses/${courseId}/enrollments`)
  },

  create: async (data: any) => {
    return apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/courses/${id}`, {
      method: 'DELETE',
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

export const weeksAPI = {
  getAll: async (filters?: { course_id?: string }) => {
    const params = new URLSearchParams()
    if (filters?.course_id) params.append('course_id', filters.course_id)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/weeks${query}`)
  },

  getByCourse: async (courseId: string) => {
    return apiRequest(`/weeks?course_id=${courseId}`)
  },

  create: async (data: any) => {
    return apiRequest('/weeks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  lock: async (id: string, locked: boolean) => {
    return apiRequest(`/weeks/${id}/lock`, {
      method: 'PATCH',
      body: JSON.stringify({ locked }),
    })
  },
}

export const videosAPI = {
  getByWeek: async (weekId: string) => {
    return apiRequest(`/videos?week_id=${weekId}`)
  },

  getAll: async (filters?: { week_id?: string }) => {
    const params = new URLSearchParams()
    if (filters?.week_id) params.append('week_id', filters.week_id)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/videos${query}`)
  },

  create: async (data: any) => {
    return apiRequest('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  upload: async (file: File, weekId: string, title: string, description?: string, durationMinutes?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('week_id', weekId)
    formData.append('title', title)
    if (description) formData.append('description', description)
    if (durationMinutes) formData.append('duration_minutes', durationMinutes.toString())

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('supabase.auth.token')
        : null

      const headers: any = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data)
        throw new Error(data.error || data.message || 'Upload failed')
      }

      return data
    } catch (error: any) {
      console.error('Upload Error:', error)
      return {
        success: false,
        error: error.message || 'Something went wrong'
      }
    }
  },

  delete: async (id: string) => {
    return apiRequest(`/videos/${id}`, {
      method: 'DELETE',
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ==========================================
// TASKS API
// ==========================================

export const tasksAPI = {
  getAll: async (filters?: { status?: string; course_id?: string; domain?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.course_id) params.append('course_id', filters.course_id)
    if (filters?.domain) params.append('domain', filters.domain)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/tasks${query}`)
  },

  getById: async (id: string) => {
    return apiRequest(`/tasks/${id}`)
  },

  create: async (data: any) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  getSubmissions: async (taskId: string, status?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/tasks/${taskId}/submissions${query}`)
  },

  evaluateSubmission: async (submissionId: string, data: any) => {
    return apiRequest(`/submissions/${submissionId}/evaluate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

// ==========================================
// SUBMISSIONS API
// ==========================================

export const submissionsAPI = {
  getAll: async (status?: string) => {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/submissions${query}`)
  },

  evaluate: async (submissionId: string, data: { status: string; points_awarded: number; feedback?: string }) => {
    return apiRequest(`/submissions/${submissionId}/evaluate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

// ==========================================
// SETTINGS API
// ==========================================
export const settingsAPI = {
  getProfile: async () => {
    return apiRequest('/settings')
  },

  updateProfile: async (data: any) => {
    return apiRequest('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('supabase.auth.token')
        : null

      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE_URL}/settings/avatar/upload`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.message || 'Upload failed')
      return data
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      return { success: false, error: error.message }
    }
  }
}

// change password
settingsAPI.changePassword = async (current_password: string, new_password: string) => {
  return apiRequest('/settings/password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  })
}

// ==========================================
// PROJECTS API
// ==========================================

export const projectsAPI = {
  getAll: async (filters?: { status?: string; user_id?: string; course_id?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.user_id) params.append('user_id', filters.user_id)
    if (filters?.course_id) params.append('course_id', filters.course_id)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/projects${query}`)
  },

  getById: async (id: string) => {
    return apiRequest(`/projects/${id}`)
  },

  create: async (data: {
    title: string
    description?: string
    course_id: string
    user_id: string
  }) => {
    return apiRequest(`/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  approve: async (projectId: string, data: any) => {
    return apiRequest(`/projects/${projectId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updateMilestone: async (milestoneId: string, data: any) => {
    return apiRequest(`/milestones/${milestoneId}/update`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

// ==========================================
// BADGES API
// ==========================================

export const badgesAPI = {
  getAll: async () => {
    return apiRequest('/badges')
  },

  create: async (data: any) => {
    return apiRequest('/badges', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/badges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/badges/${id}`, {
      method: 'DELETE',
    })
  },

  awardToUser: async (userId: string, badgeId: string) => {
    return apiRequest(`/users/${userId}/badges`, {
      method: 'POST',
      body: JSON.stringify({ badge_id: badgeId }),
    })
  },

  removeFromUser: async (userId: string, badgeId: string) => {
    return apiRequest(`/users/${userId}/badges/${badgeId}`, {
      method: 'DELETE',
    })
  },

  getUserBadges: async (userId: string) => {
    return apiRequest(`/users/${userId}/badges`)
  },
}

// ==========================================
// CERTIFICATES API
// ==========================================

export const certificatesAPI = {
  getAll: async (filters?: { status?: string; course_id?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.course_id) params.append('course_id', filters.course_id)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/certificates${query}`)
  },

  getPending: async (courseId?: string) => {
    const params = new URLSearchParams()
    if (courseId) params.append('course_id', courseId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/certificates/pending${query}`)
  },

  issue: async (data: { user_id: string; course_id: string }) => {
    return apiRequest('/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getEligible: async (courseId: string) => {
    return apiRequest(`/certificates/eligible?course_id=${courseId}`)
  },

  issueBatch: async (data: {
    course_id: string;
    domain: string;
    student_ids: string[];
    issue_type: string;
    send_email: boolean
  }) => {
    return apiRequest('/certificates/issue/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getById: async (id: string) => {
    return apiRequest(`/certificates/${id}`)
  },

  delete: async (id: string) => {
    return apiRequest(`/certificates/${id}`, {
      method: 'DELETE',
    })
  },

  revoke: async (id: string) => {
    return apiRequest(`/certificates/${id}/revoke`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'revoked' }),
    })
  },

  getStudentCertificates: async () => {
    return apiRequest('/student/certificates')
  },
}

// ==========================================
// TICKETS API
// ==========================================

export const ticketsAPI = {
  getAll: async (filters?: { status?: string; priority?: string; assigned_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/tickets${query}`)
  },

  getById: async (id: string) => {
    return apiRequest(`/tickets/${id}`)
  },

  reply: async (ticketId: string, data: any) => {
    return apiRequest(`/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getMessages: async (ticketId: string) => {
    return apiRequest(`/tickets/${ticketId}/reply`)
  },

  updateStatus: async (ticketId: string, data: any) => {
    return apiRequest(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/tickets/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==========================================
// REPORTS/ANALYTICS API
// ==========================================

export const reportsAPI = {
  getOverview: async () => {
    return apiRequest('/reports/overview')
  },

  getStudentProgress: async (userId?: string) => {
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/reports/student-progress${query}`)
  },

  getCourseAnalytics: async (courseId?: string) => {
    const params = new URLSearchParams()
    if (courseId) params.append('course_id', courseId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest(`/reports/course-analytics${query}`)
  },

  getActivity: async (limit = 50, days = 7) => {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('days', days.toString())
    return apiRequest(`/reports/activity?${params.toString()}`)
  },
}

// ==========================================
// STUDENT API (Non-Admin endpoints)
// ==========================================

export const studentAPI = {
  // Tasks for students
  tasks: {
    getAll: async (filters?: { course_id?: string; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.course_id) params.append('course_id', filters.course_id)
      if (filters?.status) params.append('status', filters.status)
      const query = params.toString() ? `?${params.toString()}` : ''
      
      // Use student endpoint instead of admin
      return apiRequest(`/student/tasks${query}`.replace('/admin', ''))
    },
  },

  // Projects for students
  projects: {
    getAll: async () => {
      return apiRequest('/student/projects')
    },

    submit: async (projectId: string, data: { 
      project_url: string; 
      github_url?: string; 
      status?: string;
      notes?: string 
    }) => {
      return apiRequest(`/student/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
  },

  // Submissions for students
  submissions: {
    getAll: async (filters?: { task_id?: string; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.task_id) params.append('task_id', filters.task_id)
      if (filters?.status) params.append('status', filters.status)
      const query = params.toString() ? `?${params.toString()}` : ''
      
      return apiRequest(`/student/submissions${query}`.replace('/admin', ''))
    },

    submit: async (data: { 
      task_id: string; 
      submission_url?: string; 
      submission_text?: string 
    }) => {
      return apiRequest('/student/submissions'.replace('/admin', ''), {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },
}

// Export default API object
export const api = {
  students: studentsAPI,
  courses: coursesAPI,
  weeks: weeksAPI,
  videos: videosAPI,
  tasks: tasksAPI,
  submissions: submissionsAPI,
  projects: projectsAPI,
  badges: badgesAPI,
  certificates: certificatesAPI,
  tickets: ticketsAPI,
  reports: reportsAPI,
  student: studentAPI,
}
