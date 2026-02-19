'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Course {
  id: string
  title: string
  description: string
  duration_weeks: number
  level: string
  status: string
  created_at: string
}

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_weeks: 0,
    level: 'beginner',
    status: 'draft'
  })

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.courses.getById(courseId)
      if (result.success && result.data) {
        setCourse(result.data)
        setFormData({
          title: result.data.title || '',
          description: result.data.description || '',
          duration_weeks: result.data.duration_weeks || 0,
          level: result.data.level || 'beginner',
          status: result.data.status || 'draft'
        })
      } else {
        setError(result.error || 'Failed to load course. Please try again.')
      }
    } catch (error) {
      console.error('Failed to load course:', error)
      setError('Error loading course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Course title is required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const result = await api.courses.update(courseId, formData)
      
      if (result.success) {
        router.push('/admin/courses')
      } else {
        setError(result.error || 'Failed to update course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      setError('Error saving course. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            <FiArrowLeft className="text-2xl text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Course</h1>
            <p className="text-gray-600 mt-1">Update course details and settings</p>
          </div>
        </div>

        {/* Error Card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiAlertCircle className="text-4xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Unable to Load Course</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/admin/courses')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              Back to Courses
            </button>
            <button
              onClick={loadCourse}
              className="px-6 py-3 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-lg transition-all"
        >
          <FiArrowLeft className="text-2xl text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Course</h1>
          <p className="text-gray-600 mt-1">Update course details and settings</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-700">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-8 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter course title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter course description"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
          />
        </div>

        {/* Course Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Duration Weeks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (Weeks)
            </label>
            <input
              type="number"
              value={formData.duration_weeks}
              onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 0 })}
              placeholder="Enter number of weeks"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
