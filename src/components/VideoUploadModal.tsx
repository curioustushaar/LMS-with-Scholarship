'use client'

import { useState } from 'react'
import { FiX, FiUpload, FiLoader, FiAlertCircle, FiCheck, FiLink } from 'react-icons/fi'
import { api } from '@/lib/api'

interface VideoUploadModalProps {
  weekId: string
  weekNumber: number
  courseId: string
  onClose: () => void
  onSuccess: () => void
}

export default function VideoUploadModal({
  weekId,
  weekNumber,
  courseId,
  onClose,
  onSuccess,
}: VideoUploadModalProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0]
      console.log('File dropped:', selectedFile.name, selectedFile.type, selectedFile.size)

      if (selectedFile.type.startsWith('video/')) {
        if (selectedFile.size > 500 * 1024 * 1024) {
          setError('File is too large. Maximum size is 500MB.')
          return
        }
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select a video file (MP4, WebM, MOV, AVI)')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      console.log('File selected:', selectedFile.name, selectedFile.type, selectedFile.size)

      if (selectedFile.type.startsWith('video/')) {
        if (selectedFile.size > 500 * 1024 * 1024) {
          setError('File is too large. Maximum size is 500MB.')
          return
        }
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select a video file (MP4, WebM, MOV, AVI)')
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title.trim()) {
      setError('Please enter a video title')
      return
    }

    if (uploadMethod === 'file') {
      if (!file) {
        setError('Please select a video file')
        return
      }
    } else {
      if (!videoUrl.trim()) {
        setError('Please enter a video URL')
        return
      }
    }

    if (!weekId) {
      setError('Week ID is missing')
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      if (uploadMethod === 'file') {
        console.log('Starting file upload for week:', weekId, 'file:', file!.name)

        const result = await api.videos.upload(
          file!,
          weekId,
          title.trim(),
          description.trim() || undefined,
          duration ? parseInt(duration) : undefined
        )

        console.log('Upload result:', result)
        setUploadProgress(90)

        if (result.success) {
          setSuccess(true)
          setUploadProgress(100)
          setFile(null)
          setTitle('')
          setDescription('')
          setDuration('')

          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          setError(result.error || 'Upload failed')
        }
      } else {
        // URL upload method
        console.log('Adding video link for week:', weekId, 'URL:', videoUrl)

        const videoData = {
          week_id: weekId,
          title: title.trim(),
          description: description.trim() || null,
          video_url: videoUrl.trim(),
          duration_minutes: duration ? parseInt(duration) : null,
          order_index: 0
        }

        const result = await api.videos.create(videoData)
        setUploadProgress(90)

        if (result.success) {
          setSuccess(true)
          setUploadProgress(100)
          setTitle('')
          setDescription('')
          setVideoUrl('')
          setDuration('')

          setTimeout(() => {
            onSuccess()
          }, 2000)
        } else {
          setError(result.error || 'Failed to add video')
        }
      }
    } catch (err: any) {
      console.error('Upload/add error:', err)
      setError(err.message || 'Operation failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Add Video</h2>
            <p className="text-xs sm:text-sm opacity-90 mt-1">Week {weekNumber}</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="text-xl sm:text-2xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleUpload} className="p-6 space-y-6">
          {/* Upload Method Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setUploadMethod('file')
                setError('')
              }}
              disabled={uploading}
              className={`flex-1 px-2 sm:px-4 py-3 font-semibold border-b-2 transition-colors text-sm sm:text-base ${uploadMethod === 'file'
                  ? 'border-[#C81E4E] text-[#C81E4E]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                } disabled:opacity-50`}
            >
              <FiUpload className="inline mr-1 sm:mr-2" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod('url')
                setError('')
              }}
              disabled={uploading}
              className={`flex-1 px-2 sm:px-4 py-3 font-semibold border-b-2 transition-colors text-sm sm:text-base ${uploadMethod === 'url'
                  ? 'border-[#C81E4E] text-[#C81E4E]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                } disabled:opacity-50`}
            >
              <FiLink className="inline mr-1 sm:mr-2" />
              Paste URL/Link
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <FiCheck className="text-green-600 text-xl" />
              <div>
                <p className="font-semibold text-green-800">Video added successfully!</p>
                <p className="text-sm text-green-700">Refreshing course data...</p>
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

          {/* File Upload Section */}
          {uploadMethod === 'file' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragActive
                  ? 'border-[#C81E4E] bg-[#C81E4E]/10'
                  : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-[#C81E4E]/50 hover:bg-gray-50'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-input"
                disabled={uploading}
              />
              <label
                htmlFor="video-input"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${uploading ? 'pointer-events-none' : ''}`}
              >
                {uploading ? (
                  <>
                    <FiLoader className="text-4xl text-[#C81E4E] animate-spin" />
                    <span className="text-lg font-semibold text-gray-700">
                      Uploading... {uploadProgress}%
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#C81E4E] h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </>
                ) : file ? (
                  <>
                    <FiCheck className="text-4xl text-green-600" />
                    <span className="text-lg font-semibold text-green-700">
                      {file.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-[#C81E4E] hover:underline mt-2"
                    >
                      Change file
                    </button>
                  </>
                ) : (
                  <>
                    <FiUpload className="text-4xl text-[#C81E4E]" />
                    <span className="text-lg font-semibold text-gray-700">
                      Drop video here or click to select
                    </span>
                    <span className="text-sm text-gray-500">
                      Supported: MP4, WebM, MOV, AVI (Max 500MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* URL Input Section */}
          {uploadMethod === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiLink className="inline mr-2" />
                  Video URL/Link *
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or direct video URL"
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent disabled:opacity-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Supports YouTube, Vimeo, direct video files, or any video hosting platform</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Paste any publicly accessible video URL. Works with YouTube, Vimeo, Dailymotion, direct MP4 links, and more.
                </p>
              </div>
            </div>
          )}

          {/* Common Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Web Development"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                disabled={uploading}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description about this video..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent resize-none"
                disabled={uploading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (Minutes, Optional)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45"
                min="1"
                max="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Upload Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> {uploadMethod === 'file' ? 'Videos are uploaded to Supabase Storage.' : 'Videos are linked from your provided URL.'} Once added, students in this course can watch the video.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !title.trim() || (uploadMethod === 'file' ? !file : !videoUrl.trim())}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              {uploading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>{uploadMethod === 'file' ? 'Uploading...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  {uploadMethod === 'file' ? <FiUpload /> : <FiLink />}
                  <span>{uploadMethod === 'file' ? 'Upload Video' : 'Add Video Link'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
