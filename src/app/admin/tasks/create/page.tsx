'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiX, FiCalendar, FiFileText } from 'react-icons/fi'
import { api } from '@/lib/api'

export default function CreateTaskPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    week_id: '',
    course_id: '',
    deadline: '',
    max_points: 100,
    instructions: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const result = await api.courses.getAll()
      if (result.success && result.data) {
        setCourses(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.title.trim() || !formData.description.trim() || !formData.deadline || !formData.course_id) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      // Combine instructions with description if provided
      const fullDescription = formData.instructions
        ? `${formData.description}\n\nInstructions:\n${formData.instructions}`
        : formData.description

      const result = await api.tasks.create({
        title: formData.title,
        description: fullDescription,
        course_id: formData.course_id,
        // Only send week_id if it's empty string, convert to null
        week_id: (!formData.week_id || formData.week_id === '') ? null : formData.week_id,
        due_date: new Date(formData.deadline).toISOString(),
        max_points: formData.max_points,
        status: 'active'
      })

      if (result.success) {
        alert('Task created successfully!')
        router.push('/admin/tasks')
      } else {
        setError(result.error || 'Failed to create task')
      }
    } catch (err) {
      setError('Error creating task')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Task</h1>
          <p className="text-gray-600 mt-1">Add a new assignment or task for students</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center space-x-2"
        >
          <FiX className="text-xl" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 sm:p-8">
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiFileText className="text-[#C81E4E]" />
              <span>Task Information</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  placeholder="e.g., Build a Portfolio Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  placeholder="Provide a brief description of the task"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                    disabled={loadingCourses}
                  >
                    <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Week (Optional)
                  </label>
                  <select
                    value={formData.week_id}
                    onChange={(e) => setFormData({ ...formData, week_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  >
                    <option value="">Select a week (optional)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={`week-${w}`}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiCalendar className="text-[#C81E4E]" />
              <span>Submission Details</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.max_points}
                  onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              rows={3}
              placeholder="Add instructions for students"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || loadingCourses}
              className="flex-1 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
