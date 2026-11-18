'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCalendar, FiFileText, FiCheck, FiX } from 'react-icons/fi'
import { api } from '@/lib/api'

export default function SchoolCreateTaskPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
        const list = Array.isArray(result.data) ? result.data : []
        setCourses(list)
        if (list.length > 0 && !formData.course_id) {
          setFormData(prev => ({ ...prev, course_id: list[0].id }))
        }
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

    if (!formData.title.trim()) {
      setError('Task title is required.')
      setLoading(false)
      return
    }

    if (!formData.description.trim()) {
      setError('Task description is required.')
      setLoading(false)
      return
    }

    if (!formData.course_id) {
      setError('Please select a course for this task.')
      setLoading(false)
      return
    }

    if (!formData.deadline) {
      setError('Task deadline is required.')
      setLoading(false)
      return
    }

    try {
      const fullDescription = formData.instructions
        ? `${formData.description.trim()}\n\nInstructions:\n${formData.instructions.trim()}`
        : formData.description.trim()

      const result = await api.tasks.create({
        title: formData.title.trim(),
        description: fullDescription,
        course_id: formData.course_id,
        due_date: new Date(formData.deadline).toISOString(),
        max_points: Number(formData.max_points) || 100,
        status: 'active'
      })

      if (result.success) {
        alert('Task created successfully! ✅')
        router.push('/school-portal/tasks')
      } else {
        setError(result.error || 'Failed to create task')
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error creating task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/school-portal/tasks"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft />
        <span>Back to Tasks & Assignments</span>
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 pb-6 border-b border-gray-100">
          <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest block mb-1">
            New Task Assignment
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Create Course Task</h1>
          <p className="text-xs text-gray-500 mt-1">Assign weekly homework, practical assignments, or coding challenges to students</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Course Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Course *
            </label>
            {loadingCourses ? (
              <div className="text-xs text-gray-400">Loading courses...</div>
            ) : (
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
                required
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Week 2: Responsive Navbar Implementation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Task Description & Brief *
            </label>
            <textarea
              rows={4}
              placeholder="Describe what the student needs to complete and what deliverables are expected..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
              required
            />
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Submission Guidelines / Specific Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Upload GitHub repo link with README. Ensure code comments are present."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
            />
          </div>

          {/* Deadline and Max Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Deadline Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Maximum Points / Marks
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={formData.max_points}
                onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/school-portal/tasks"
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Creating Task...' : 'Publish Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

