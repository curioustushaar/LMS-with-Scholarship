'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiPlus, FiTrash2, FiExternalLink, FiSearch, FiLoader, FiDownload, FiLink } from 'react-icons/fi'
import { api } from '@/lib/api'
import VideoUploadModal from '@/components/VideoUploadModal'
import AddVideoModal from '@/components/AddVideoModal'

interface Video {
  id: string
  week_id: string
  title: string
  description?: string
  video_url: string
  duration_minutes?: number
  created_at: string
}

interface Week {
  id: string
  course_id: string
  week_number: number
  title: string
  description?: string
}

interface Course {
  id: string
  title: string
  description: string
  level: string
  duration_weeks: number
  status: string
  weeks?: Week[]
}

interface CourseVideos {
  course: Course
  weeks: Week[]
  videos: { [weekId: string]: Video[] }
}

export default function VideosPage() {
  const [allCourses, setAllCourses] = useState<CourseVideos[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCourses, setExpandedCourses] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddVideoModal, setShowAddVideoModal] = useState(false)
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  useEffect(() => {
    loadAllCoursesData()
  }, [])

  const loadAllCoursesData = async () => {
    try {
      setLoading(true)
      const coursesResult = await api.courses.getAll()
      console.log('All courses:', coursesResult)

      if (coursesResult.success && coursesResult.data) {
        const courses = Array.isArray(coursesResult.data) ? coursesResult.data : []
        const coursesWithVideos: CourseVideos[] = []

        for (const course of courses) {
          try {
            // Get weeks for this course
            const weeksResult = await api.weeks.getByCourse(course.id)
            const weeks = weeksResult.success && weeksResult.data 
              ? (Array.isArray(weeksResult.data) ? weeksResult.data : [])
              : []

            // Get videos for each week
            const weekVideos: { [weekId: string]: Video[] } = {}
            for (const week of weeks) {
              const videosResult = await api.videos.getByWeek(week.id)
              weekVideos[week.id] = videosResult.success && videosResult.data
                ? (Array.isArray(videosResult.data) ? videosResult.data : [])
                : []
            }

            coursesWithVideos.push({
              course,
              weeks,
              videos: weekVideos
            })
          } catch (err) {
            console.error(`Error loading data for course ${course.id}:`, err)
            coursesWithVideos.push({
              course,
              weeks: [],
              videos: {}
            })
          }
        }

        setAllCourses(coursesWithVideos)
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const openUploadModal = (courseId: string, weekId: string, weekNumber: number) => {
    setSelectedCourseId(courseId)
    setSelectedWeekId(weekId)
    setSelectedWeekNumber(weekNumber)
    setShowUploadModal(true)
  }

  const openAddVideoModal = (courseId: string, weekId: string, weekNumber: number) => {
    setSelectedCourseId(courseId)
    setSelectedWeekId(weekId)
    setSelectedWeekNumber(weekNumber)
    setShowAddVideoModal(true)
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setSelectedWeekId(null)
    setSelectedWeekNumber(null)
    setSelectedCourseId(null)
  }

  const handleVideoUploadSuccess = () => {
    closeUploadModal()
    loadAllCoursesData()
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This will permanently remove it from the database and storage.')) return

    try {
      const result = await api.videos.delete(videoId)
      if (result.success) {
        alert('Video deleted successfully! ✅')
        loadAllCoursesData()
      } else {
        alert('Failed to delete video: ' + (result.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error deleting video:', error)
      alert('Error deleting video: ' + (error?.message || 'Network or server error'))
    }
  }

  const filteredCourses = allCourses.filter(item =>
    (item.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.course?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  const getTotalVideos = (courseVideos: CourseVideos) => {
    return Object.values(courseVideos.videos).reduce((sum, videos) => sum + videos.length, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/courses" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Courses</span>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold">🎬 Videos Management</h1>
        <p className="mt-2 text-lg opacity-90">Upload and manage course videos by week</p>
        <div className="mt-6 flex items-center space-x-4">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm opacity-90">Courses</p>
            <p className="text-2xl font-bold">{filteredCourses.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm opacity-90">Total Videos</p>
            <p className="text-2xl font-bold">
              {filteredCourses.reduce((sum, item) => sum + getTotalVideos(item), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-3 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
        />
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
            <p className="text-lg">No courses found</p>
          </div>
        ) : (
          filteredCourses.map((courseData) => (
            <div key={courseData.course.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Course Header */}
              <button
                onClick={() => toggleCourseExpand(courseData.course.id)}
                className="w-full px-6 py-5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="text-left flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{courseData.course.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{courseData.course.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                      📚 {courseData.weeks.length} weeks
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                      🎬 {getTotalVideos(courseData)} videos
                    </span>
                  </div>
                </div>
                <div className={`text-3xl text-gray-600 transition-transform duration-300 ${expandedCourses.includes(courseData.course.id) ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              {/* Expanded Content */}
              {expandedCourses.includes(courseData.course.id) && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {courseData.weeks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-2xl mb-2">📚</p>
                      <p className="text-gray-700 font-semibold mb-2">No weeks created yet</p>
                      <p className="text-sm text-gray-600 mb-6">Create weeks first, then upload videos to them</p>
                      <Link href={`/admin/courses/${courseData.course.id}`} className="inline-block px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg font-bold">
                        Go to Course & Create Weeks
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {courseData.weeks.map((week) => (
                        <div key={week.id} className="p-6 bg-white hover:bg-gray-50 transition-colors">
                          {/* Week Header with Upload Button - ALWAYS VISIBLE */}
                          <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">
                                📅 Week {week.week_number}: {week.title}
                              </h3>
                              {week.description && (
                                <p className="text-sm text-gray-600">{week.description}</p>
                              )}
                              <div className="mt-2 inline-block">
                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                  🎬 {courseData.videos[week.id]?.length || 0} videos
                                </span>
                              </div>
                            </div>
                            {/* UPLOAD & ADD VIDEO BUTTONS */}
                            <div className="ml-4 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => openUploadModal(courseData.course.id, week.id, week.week_number)}
                                className="px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center space-x-2 whitespace-nowrap text-sm"
                              >
                                <FiPlus className="text-lg" />
                                <span>Upload</span>
                              </button>
                              <button
                                onClick={() => openAddVideoModal(courseData.course.id, week.id, week.week_number)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center space-x-2 whitespace-nowrap text-sm"
                              >
                                <FiLink className="text-lg" />
                                <span>Add Link</span>
                              </button>
                            </div>
                          </div>

                          {/* VIDEO LIST - ALWAYS VISIBLE */}
                          {courseData.videos[week.id] && courseData.videos[week.id].length > 0 ? (
                            <div className="mt-4">
                              <p className="text-sm font-bold text-gray-700 mb-3">📹 Videos in this week:</p>
                              <div className="space-y-3">
                                {courseData.videos[week.id].map((video) => (
                                  <div key={video.id} className="bg-white border-l-4 border-[#C81E4E] rounded-lg p-4 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-800">{video.title}</h4>
                                        {video.description && (
                                          <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                                          {video.duration_minutes && (
                                            <span>⏱️ {video.duration_minutes} min</span>
                                          )}
                                          <span>📅 {new Date(video.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 ml-4">
                                        <a
                                          href={video.video_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center space-x-1 whitespace-nowrap"
                                        >
                                          <FiExternalLink />
                                          <span>View</span>
                                        </a>
                                        <a
                                          href={video.video_url}
                                          download={video.title}
                                          className="px-3 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center space-x-1 whitespace-nowrap"
                                        >
                                          <FiDownload />
                                          <span>Download</span>
                                        </a>
                                        <button
                                          onClick={() => handleDeleteVideo(video.id)}
                                          className="px-3 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center space-x-1 whitespace-nowrap"
                                        >
                                          <FiTrash2 />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg text-center italic mt-4">
                              🎬 No videos yet. Click "Upload Video" above to add one!
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Video Upload Modal */}
      {showUploadModal && selectedWeekId && selectedWeekNumber && selectedCourseId && (
        <VideoUploadModal
          weekId={selectedWeekId}
          weekNumber={selectedWeekNumber}
          courseId={selectedCourseId}
          onClose={closeUploadModal}
          onSuccess={handleVideoUploadSuccess}
        />
      )}

      {/* Add Video Link Modal */}
      {showAddVideoModal && selectedWeekId && selectedWeekNumber && selectedCourseId && (
        <AddVideoModal
          weekId={selectedWeekId}
          weekNumber={selectedWeekNumber}
          courseId={selectedCourseId}
          onClose={() => setShowAddVideoModal(false)}
          onSuccess={handleVideoUploadSuccess}
        />
      )}
    </div>
  )
}
