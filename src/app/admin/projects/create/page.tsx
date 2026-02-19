'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Course {
  id: string
  title: string
  domain?: string
}

interface User {
  id: string
  full_name: string
  email: string
  domain?: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    user_id: '',
    deadline: ''
  })

  const [courses, setCourses] = useState<Course[]>([])
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [filteredStudents, setFilteredStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadCourses()
    loadStudents()
  }, [])

  // Filter students when course selection changes
  useEffect(() => {
    filterStudentsByDomain()
  }, [formData.course_id, allStudents])

  const loadCourses = async () => {
    try {
      const result = await api.courses.getAll()
      if (result.success && result.data) {
        setCourses(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const result = await api.students.getAll()
      if (result.success && result.data) {
        const studentsList = Array.isArray(result.data) ? result.data : []
        setAllStudents(studentsList)
        setFilteredStudents(studentsList)
      }
    } catch (error) {
      console.error('Failed to load students:', error)
    }
  }

  const filterStudentsByDomain = async () => {
    if (!formData.course_id) {
      setFilteredStudents(allStudents)
      return
    }

    try {
      // Get enrollments for the selected course
      const enrollmentsResult = await api.courses.getEnrollments(formData.course_id)
      
      if (!enrollmentsResult.success || !enrollmentsResult.data) {
        console.log('No enrollments found for this course')
        setFilteredStudents([])
        return
      }

      const enrollments = Array.isArray(enrollmentsResult.data) ? enrollmentsResult.data : []
      
      // Extract enrolled student IDs
      const enrolledUserIds = enrollments.map((e: any) => e.user_id || e.user?.id).filter(Boolean)
      
      // Filter students who are enrolled in this course
      const filtered = allStudents.filter(student => 
        enrolledUserIds.includes(student.id)
      )

      console.log(`📚 Course selected: ${formData.course_id}`)
      console.log(`✅ Found ${filtered.length} enrolled students`)
      
      setFilteredStudents(filtered)
      
      // Reset student selection if current selection is not in filtered list
      if (formData.user_id && !filtered.find(s => s.id === formData.user_id)) {
        setFormData(prev => ({ ...prev, user_id: '' }))
      }
    } catch (error) {
      console.error('Error filtering students:', error)
      setFilteredStudents([])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Project title is required')
      }
      if (!formData.course_id) {
        throw new Error('Please select a course/domain')
      }
      if (!formData.user_id) {
        throw new Error('Please select a student')
      }

      const result = await api.projects.create(formData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/projects')
        }, 1500)
      } else {
        throw new Error(result.error || 'Failed to create project')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('Create project error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="text-2xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Project</h1>
          <p className="text-gray-600 mt-1">Assign a new project to a student</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ Project created successfully! Redirecting...
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description and requirements"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] resize-none"
              disabled={loading}
            />
          </div>

          {/* Course/Domain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course/Domain <span className="text-red-500">*</span>
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              disabled={loading}
            >
              <option value="">Select a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Student <span className="text-red-500">*</span>
            </label>
            {!formData.course_id ? (
              <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 text-sm">
                Please select a course first to see enrolled students
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="px-4 py-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-700 text-sm">
                ⚠️ No students enrolled in this course. Please enroll students first from the course page.
              </div>
            ) : (
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                disabled={loading}
              >
                <option value="">Select a student...</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.email})
                  </option>
                ))}
              </select>
            )}
            {formData.course_id && filteredStudents.length > 0 && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <span className="mr-1">✅</span>
                Showing {filteredStudents.length} enrolled student(s) in this course
              </p>
            )}
          </div>

          {/* Deadline Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Deadline (Optional)
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1 italic">
              When the student should ideally submit this project
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? '⏳ Creating...' : '✨ Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
