'use client'

import { useState } from 'react'
import { FiX, FiLink, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { api } from '@/lib/api'

interface AddVideoModalProps {
  weekId: string
  weekNumber: number
  courseId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddVideoModal({
  weekId,
  weekNumber,
  courseId,
  onClose,
  onSuccess,
}: AddVideoModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title.trim()) {
      setError('Video title is required')
      return
    }

    if (!videoUrl.trim()) {
      setError('Video URL is required')
      return
    }

    try {
      setLoading(true)
      
      const videoData = {
        week_id: weekId,
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        duration_minutes: duration ? parseInt(duration) : null,
        order_index: 0
      }

      console.log('Adding video:', videoData)
      
      // Use the videos API to create video
      const result = await api.videos.create(videoData)

      if (result.success) {
        setSuccess(true)
        setTitle('')
        setDescription('')
        setVideoUrl('')
        setDuration('')
        
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(result.error || 'Failed to add video')
      }
    } catch (err: any) {
      console.error('Error adding video:', err)
      setError(err.message || 'Failed to add video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Add Video</h2>
            <p className="text-sm opacity-90 mt-1">Week {weekNumber}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <FiCheck className="text-green-600 text-xl" />
              <div>
                <p className="font-semibold text-green-800">Video added successfully!</p>
                <p className="text-sm text-green-700">Refreshing...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <FiAlertCircle className="text-red-600 text-xl mt-0.5 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Video Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50"
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FiLink className="inline mr-2" />
              Video URL/Link *
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Supports YouTube, Vimeo, or direct video URL</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 45"
              min="1"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FiLink />
                  <span>Add Video</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> You can paste any video URL (YouTube, Vimeo, etc.) or link to a direct video file. Make sure the link is publicly accessible.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
