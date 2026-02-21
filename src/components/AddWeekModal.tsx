'use client'

import { useState } from 'react'
import { FiX, FiPlus, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { api } from '@/lib/api'

interface AddWeekModalProps {
  courseId: string
  totalWeeks: number
  onClose: () => void
  onSuccess: () => void
}

export default function AddWeekModal({
  courseId,
  totalWeeks,
  onClose,
  onSuccess,
}: AddWeekModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const nextWeekNumber = totalWeeks + 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title.trim()) {
      setError('Week title is required')
      return
    }

    try {
      setLoading(true)
      
      const weekData = {
        course_id: courseId,
        week_number: nextWeekNumber,
        title: title.trim(),
        description: description.trim() || null,
      }

      console.log('Adding week:', weekData)
      
      const result = await api.weeks.create(weekData)

      if (result.success) {
        setSuccess(true)
        setTitle('')
        setDescription('')
        
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(result.error || 'Failed to create week')
      }
    } catch (err: any) {
      console.error('Error adding week:', err)
      setError(err.message || 'Failed to create week')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] overflow-y-auto">
      <div className="min-h-screen px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Add New Week</h2>
              <p className="text-xs sm:text-sm opacity-90 mt-1">Week {nextWeekNumber}</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center space-x-3">
              <FiCheck className="text-green-600 text-lg sm:text-xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-sm sm:text-base">Week added successfully!</p>
                <p className="text-xs sm:text-sm text-green-700">Refreshing course data...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start space-x-3">
              <FiAlertCircle className="text-red-600 text-lg sm:text-xl mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* Week Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Week Number
            </label>
            <input
              type="text"
              value={nextWeekNumber}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">Week number is auto-assigned based on existing weeks</p>
          </div>

          {/* Week Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Week Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to HTML"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50 text-sm sm:text-base"
              required
            />
          </div>

          {/* Week Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Week Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description of this week's content..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50 resize-none text-sm sm:text-base"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>💡 Next Steps:</strong> After creating this week, you can add videos to it from the Weeks & Content tab.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiPlus />
                  <span>Add Week</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
