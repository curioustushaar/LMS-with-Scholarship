'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiEdit, FiLock, FiUnlock, FiRefreshCw, FiMail, FiPhone, FiCalendar, FiExternalLink, FiFolder } from 'react-icons/fi'
import { api } from '@/lib/api'

export default function StudentDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStudent()
  }, [params.id])

  const loadStudent = async () => {
    try {
      const result = await api.students.getById(params.id as string)
      if (result.success && result.data) {
        setStudent(result.data)
        setEditData(result.data)
      }
    } catch (error) {
      console.error('Failed to load student:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await api.students.update(params.id as string, editData)
      if (result.success) {
        setStudent(editData)
        setIsEditing(false)
        alert('Student updated successfully!')
      } else {
        alert('Failed to update student: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Error updating student')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(student)
    setIsEditing(false)
  }

  const handleResetPassword = async () => {
    if (confirm('Are you sure you want to reset the password for this student?')) {
      try {
        const result = await api.students.resetPassword(params.id as string)
        if (result.success) {
          alert('Password reset email sent successfully!')
        } else {
          alert('Failed to reset password')
        }
      } catch (error) {
        console.error('Error resetting password:', error)
        alert('Error resetting password')
      }
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'courses', label: 'Enrolled Courses' },
    { id: 'progress', label: 'Course Progress' },
    { id: 'tasks', label: 'Tasks & Submissions' },
    { id: 'badges', label: 'Badges' },
    { id: 'support', label: 'Support History' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Student not found</p>
        <Link href="/admin/students" className="text-[#C81E4E] hover:text-[#D91E5B] mt-4 inline-block">
          Back to Students
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/students" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Students</span>
      </Link>

      {/* Student Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {student.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{student.full_name || 'Student'}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-4 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  {student.status || 'Active'}
                </span>
                <span className="px-4 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  Student
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FiMail className="text-[#C81E4E]" />
                  <span className="truncate">{student.email || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="text-[#C81E4E]" />
                  <span>Phone: {student.phone || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-[#C81E4E] border border-[#C81E4E] rounded px-1">Parents</span>
                  <span>{student.parents_contact || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-purple-600 border border-purple-600 rounded px-1">Class</span>
                  <span>{student.class || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-blue-600 border border-blue-600 rounded px-1">School</span>
                  <span className="truncate" title={student.school_coaching}>{student.school_coaching || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-[#C81E4E]" />
                  <span>Created: {student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href={`/admin/projects?assignUserId=${params.id}`}
              className="px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-md transition-all flex items-center space-x-2 text-sm font-semibold"
            >
              <FiFolder />
              <span>Assign Project</span>
            </Link>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 text-sm font-medium"
            >
              <FiEdit />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={handleResetPassword}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center space-x-2 text-sm font-medium"
            >
              <FiRefreshCw />
              <span>Reset Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]'
                    : 'text-gray-600 hover:text-[#C81E4E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab 
              student={student} 
              isEditing={isEditing}
              editData={editData}
              setEditData={setEditData}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />
          )}
          {activeTab === 'courses' && <EnrolledCoursesTab studentId={params.id} />}
          {activeTab === 'tasks' && <TasksTab studentId={params.id} />}
          {activeTab === 'badges' && <BadgesTab studentId={params.id} />}
          {activeTab === 'support' && <SupportTab studentId={params.id} />}
        </div>
      </div>
    </div>
  )
}

function SupportTab({ studentId }: any) {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [studentId])

  const loadTickets = async () => {
    try {
      const result = await api.tickets.getAll()
      if (result.success && result.data) {
        const studentTickets = Array.isArray(result.data)
          ? result.data.filter((t: any) => t.user_id === studentId)
          : []
        setTickets(studentTickets)
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading support history...</div>
  }

  if (tickets.length === 0) {
    return <div className="text-center py-8 text-gray-500">No support tickets found</div>
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{ticket.subject}</h3>
              <p className="text-sm text-gray-600 mt-1">Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
              ticket.status === 'open' ? 'bg-orange-100 text-orange-800' :
              ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileTab({ student, isEditing, editData, setEditData, onSave, onCancel, saving }: any) {
  if (!student || !editData) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            type="text" 
            value={editData.full_name || ''} 
            onChange={(e) => isEditing && setEditData({ ...editData, full_name: e.target.value })}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white focus:outline-none focus:ring-2 focus:ring-[#C81E4E]' : 'bg-gray-50'
            }`}
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            value={editData.email || ''} 
            onChange={(e) => isEditing && setEditData({ ...editData, email: e.target.value })}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white focus:outline-none focus:ring-2 focus:ring-[#C81E4E]' : 'bg-gray-50'
            }`}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Student Phone Number</label>
          <input 
            type="tel" 
            value={editData.phone || ''} 
            onChange={(e) => isEditing && setEditData({ ...editData, phone: e.target.value })}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white focus:outline-none focus:ring-2 focus:ring-[#C81E4E]' : 'bg-gray-50'
            }`}
          />
        </div>

        {/* Parents Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Parents Contact</label>
          <input 
            type="tel" 
            value={editData.parents_contact || ''} 
            onChange={(e) => isEditing && setEditData({ ...editData, parents_contact: e.target.value })}
            readOnly={!isEditing}
            placeholder={isEditing ? "+91 98765 43210" : "-"}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white focus:outline-none focus:ring-2 focus:ring-[#C81E4E]' : 'bg-gray-50'
            }`}
          />
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class / Grade</label>
          <input 
            type="text" 
            value={editData.class || ''} 
            onChange={(e) => isEditing && setEditData({ ...editData, class: e.target.value })}
            readOnly={!isEditing}
            placeholder={isEditing ? "e.g. 10th, 12th, B.Tech..." : "-"}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white focus:outline-none focus:ring-2 focus:ring-[#C81E4E]' : 'bg-gray-50'
            }`}
          />
        </div>

        {/* School / Coaching */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">School / Coaching</label>
          <input 
            type="text" 
            value={editData.school_coaching || ''} 
            onChange={(e) => isEditing && setEditData({ ...editData, school_coaching: e.target.value })}
            readOnly={!isEditing}
            placeholder={isEditing ? "e.g. DPS, Allen Career Institute..." : "-"}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white focus:outline-none focus:ring-2 focus:ring-[#C81E4E]' : 'bg-gray-50'
            }`}
          />
        </div>

        {/* Enrollment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
          <input 
            type="text" 
            value={editData.enrollment_date ? new Date(editData.enrollment_date).toLocaleDateString() : '-'} 
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select 
            value={editData.role || 'student'} 
            onChange={(e) => isEditing && setEditData({ ...editData, role: e.target.value })}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white cursor-pointer' : 'bg-gray-50 cursor-not-allowed'
            }`}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Account Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
          <select 
            value={editData.status || 'active'} 
            onChange={(e) => isEditing && setEditData({ ...editData, status: e.target.value })}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
              isEditing ? 'bg-white cursor-pointer' : 'bg-gray-50 cursor-not-allowed'
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      {isEditing && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button 
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-3 border-2 border-[#C81E4E] text-[#C81E4E] rounded-lg font-semibold hover:bg-[#C81E4E] hover:text-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

function ProgressTab() {
  const weeks = [
    { week: 1, title: 'Introduction to Web Development', videos: 12, completed: 12, locked: false, progress: 100 },
    { week: 2, title: 'HTML & CSS Fundamentals', videos: 15, completed: 15, locked: false, progress: 100 },
    { week: 3, title: 'JavaScript Basics', videos: 18, completed: 14, locked: false, progress: 78 },
    { week: 4, title: 'Advanced JavaScript', videos: 20, completed: 0, locked: true, progress: 0 },
  ]

  return (
    <div className="space-y-4">
      {weeks.map((week) => (
        <div key={week.week} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Week {week.week}: {week.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{week.completed} / {week.videos} videos completed</p>
            </div>
            <div className="flex items-center space-x-3">
              {week.locked ? (
                <span className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg flex items-center space-x-2">
                  <FiLock />
                  <span>Locked</span>
                </span>
              ) : (
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg flex items-center space-x-2">
                  <FiUnlock />
                  <span>Unlocked</span>
                </span>
              )}
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium">
                {week.locked ? 'Unlock Week' : 'Reset Progress'}
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] h-3 rounded-full transition-all"
              style={{ width: `${week.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{week.progress}% Complete</p>
        </div>
      ))}
    </div>
  )
}
function TasksTab({ studentId }: any) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [studentId])

  const loadTasks = async () => {
    try {
      const result = await api.tasks.getAll()
      if (result.success && result.data) {
        // Tasks don't have student_id - they belong to courses
        // This needs to be implemented properly - for now show empty
        const studentTasks: any[] = []
        setTasks(studentTasks)
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return <div className="text-center py-8 text-gray-500">No tasks found for this student</div>
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">Task #{task.task_id?.substring(0, 8)}</h3>
              <p className="text-sm text-gray-600 mt-1">Submitted: {new Date(task.submitted_at).toLocaleDateString()}</p>
              {task.feedback && (
                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">
                  <strong>Feedback:</strong> {task.feedback}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {task.marks_obtained !== null && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#C81E4E]">{task.marks_obtained}</p>
                  <p className="text-xs text-gray-600">/ 100</p>
                </div>
              )}
              <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
                task.status === 'evaluated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EnrolledCoursesTab({ studentId }: any) {
  const [enrollments, setEnrollments] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.students.getEnrollments(studentId)
        if (res.success && Array.isArray(res.data)) setEnrollments(res.data)
        else setEnrollments([])
      } catch (err) {
        console.error('Failed to load student enrollments', err)
        setEnrollments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  if (loading) return <div className="text-center py-8 text-gray-500">Loading enrolled courses...</div>
  if (!enrollments || enrollments.length === 0) return <div className="text-center py-8 text-gray-500">No enrolled courses found</div>

  return (
    <div className="space-y-4">
      {enrollments.map((e: any) => (
        <div key={e.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-800">{e.course?.title || 'Unknown Course'}</div>
            <div className="text-sm text-gray-500">Domain: {e.course?.domain || 'Unspecified'}</div>
          </div>
          <div className="text-sm text-gray-500">Enrolled: {new Date(e.enrolled_at || e.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  )
}

function BadgesTab({ studentId }: any) {
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadges()
  }, [studentId])

  const loadBadges = async () => {
    try {
      // Fetch user_badges for this student
      const result = await api.badges.getAll()
      if (result.success && result.data) {
        const userBadges = Array.isArray(result.data) ? result.data : []
        setBadges(userBadges)
      }
    } catch (error) {
      console.error('Failed to load badges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading badges...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {badges.length === 0 ? (
        <div className="text-center py-8 text-gray-500 col-span-3">No badges earned yet</div>
      ) : (
        badges.map((badge) => (
          <div key={badge.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">{badge.icon || '🏆'}</div>
            <h3 className="text-lg font-semibold text-gray-800">{badge.name}</h3>
            <p className="text-sm text-gray-600 mt-2">{badge.description}</p>
          </div>
        ))
      )}
    </div>
  )
}

function ProjectTab() {
  const project = {
    title: 'E-Commerce Website',
    status: 'In Progress',
    progress: 65,
    milestones: [
      { id: 1, title: 'Project Setup', status: 'Completed', date: '2026-01-10' },
      { id: 2, title: 'UI Design', status: 'Completed', date: '2026-01-20' },
      { id: 3, title: 'Backend Development', status: 'In Progress', date: null },
      { id: 4, title: 'Testing & Deployment', status: 'Pending', date: null },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold">{project.title}</h2>
        <p className="mt-2">Status: {project.status}</p>
        <div className="mt-4 w-full bg-white/30 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm">{project.progress}% Complete</p>
      </div>

      <div className="space-y-4">
        {project.milestones.map((milestone) => (
          <div key={milestone.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
              {milestone.date && <p className="text-sm text-gray-600 mt-1">Completed: {milestone.date}</p>}
            </div>
            <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
              milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
              milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {milestone.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
          Approve Project
        </button>
        <button className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all">
          Reject Project
        </button>
      </div>
    </div>
  )
}

function CertificateTab() {
  const certificate = {
    eligible: true,
    issued: true,
    certificateId: 'CERT-2026-001234',
    issueDate: '2026-02-01',
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-lg text-center">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold">Certificate Status</h2>
        {certificate.issued ? (
          <>
            <p className="mt-4 text-lg">Certificate has been issued!</p>
            <p className="mt-2">Certificate ID: {certificate.certificateId}</p>
            <p className="text-sm mt-1">Issued on: {certificate.issueDate}</p>
          </>
        ) : (
          <p className="mt-4 text-lg">{certificate.eligible ? 'Eligible for certificate' : 'Not eligible yet'}</p>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Eligibility Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Course completion</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">All tasks submitted</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Project approved</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Minimum 80% attendance</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        {certificate.issued ? (
          <>
            <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
              Download Certificate
            </button>
            <button className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all">
              Reissue Certificate
            </button>
            <button className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all">
              Revoke Certificate
            </button>
          </>
        ) : (
          <button className="w-full py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Issue Certificate
          </button>
        )}
      </div>
    </div>
  )
}
