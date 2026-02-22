'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FiArrowLeft, FiPlus, FiTrash2, FiBookOpen } from 'react-icons/fi'
import { superadminAPI } from '@/lib/api'

interface Course {
  id: string
  title: string
  level: string
  duration_weeks: number
}

interface Assignment {
  course_id: string
  admin_id: string
  assigned_at: string
  course: {
    title: string
    level: string
    duration_weeks: number
  }
}

export default function AdminCoursesPage() {
  const params = useParams()
  const router = useRouter()
  const adminId = params.id as string

  const [adminName, setAdminName] = useState('')
  const [assignedCourses, setAssignedCourses] = useState<Assignment[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [adminId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load admin details
      const adminsRes = await superadminAPI.getAllAdmins()
      const admin = adminsRes.data?.find((a: any) => a.id === adminId)
      if (admin) setAdminName(admin.full_name || admin.email)

      // Load assigned courses
      const assignmentsRes = await superadminAPI.getCourseAssignments(adminId)
      if (assignmentsRes.success) {
        setAssignedCourses(assignmentsRes.data || [])
      }

      // Load all courses
      const coursesRes = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${(await (await import('@/lib/supabase')).supabase.auth.getSession()).data.session?.access_token}`
        }
      })
      const coursesData = await coursesRes.json()
      if (coursesData.success) {
        setAllCourses(coursesData.data || [])
        
        // Calculate available courses (not yet assigned)
        const assignedIds = (assignmentsRes.data || []).map((a: Assignment) => a.course_id)
        setAvailableCourses((coursesData.data || []).filter((c: Course) => !assignedIds.includes(c.id)))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignCourse = async () => {
    if (!selectedCourseId) return

    setActionLoading(true)
    const response = await superadminAPI.assignCourses(adminId, [selectedCourseId])
    
    if (response.success) {
      alert('Course assigned successfully!')
      setShowAddModal(false)
      setSelectedCourseId('')
      loadData()
    } else {
      alert(response.error || 'Failed to assign course')
    }
    setActionLoading(false)
  }

  const handleRemoveCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to remove this course assignment?')) return

    setActionLoading(true)
    const response = await superadminAPI.removeCourseAssignment(adminId, courseId)
    
    if (response.success) {
      alert('Course removed successfully!')
      loadData()
    } else {
      alert(response.error || 'Failed to remove course')
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/superadmin/admins')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Admins
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Assignments
          </h1>
          <p className="text-gray-600">
            Managing courses for <span className="font-semibold">{adminName}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiBookOpen className="text-2xl text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Assigned Courses</p>
                <p className="text-2xl font-bold text-gray-900">{assignedCourses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiPlus className="text-2xl text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Available to Assign</p>
                <p className="text-2xl font-bold text-gray-900">{availableCourses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={availableCourses.length === 0}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="mr-2" />
            Assign New Course
          </button>
          {availableCourses.length === 0 && assignedCourses.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">All courses have been assigned</p>
          )}
        </div>

        {/* Assigned Courses List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-xl font-bold text-white">Assigned Courses</h2>
          </div>

          {assignedCourses.length === 0 ? (
            <div className="p-12 text-center">
              <FiBookOpen className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No courses assigned yet</p>
              <p className="text-gray-400 text-sm">
                Assign courses to allow this admin to manage specific course content and students
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {assignedCourses.map((assignment) => (
                <div
                  key={assignment.course_id}
                  className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {assignment.course.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {assignment.course.level}
                      </span>
                      <span>{assignment.course.duration_weeks} weeks</span>
                      <span className="text-gray-400">
                        Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCourse(assignment.course_id)}
                    disabled={actionLoading}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove assignment"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Course Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Course</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a course...</option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedCourseId('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCourse}
                  disabled={!selectedCourseId || actionLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
