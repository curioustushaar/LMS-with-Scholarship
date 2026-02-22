'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiPlus, FiLock, FiUnlock, FiEdit, FiTrash2, FiVideo } from 'react-icons/fi'
import { api } from '@/lib/api'
import VideoUploadModal from '@/components/VideoUploadModal'
import AddWeekModal from '@/components/AddWeekModal'

interface Course {
  id: string
  title: string
  description: string
  duration_weeks: number
  level: string
  status: string
  created_at: string
  weeks?: Week[]
}

interface Week {
  id: string
  course_id: string
  week_number: number
  title: string
  description?: string
  locked?: boolean
  created_at: string
}

interface Video {
  id: string
  week_id: string
  title: string
  description?: string
  video_url: string
  duration_minutes?: number
  order: number
  created_at: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('info')
  const [course, setCourse] = useState<Course | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showAddWeekModal, setShowAddWeekModal] = useState(false)
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null)
  const courseId = params.id as string

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const handleEditCourse = () => {
    router.push(`/admin/courses/${courseId}/edit`)
  }

  const handleOpenAddWeekModal = () => {
    setShowAddWeekModal(true)
  }

  const handleCloseAddWeekModal = () => {
    setShowAddWeekModal(false)
  }

  const handleAddWeekSuccess = () => {
    handleCloseAddWeekModal()
    loadCourseData()
  }

  const handleDeleteWeek = async (weekId: string, weekTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${weekTitle}"? This will also delete all videos in this week. This action cannot be undone.`)) {
      return
    }

    try {
      const result = await api.weeks.delete(weekId)
      if (result.success) {
        alert('Week deleted successfully!')
        loadCourseData()
      } else {
        alert('Failed to delete week: ' + result.error)
      }
    } catch (error: any) {
      alert('Error deleting week: ' + error.message)
    }
  }

  const loadCourseData = async () => {
    try {
      const result = await api.courses.getById(courseId)
      console.log('Course result:', result)
      if (result.success && result.data) {
        setCourse(result.data)
        // Use weeks data from course endpoint
        if (result.data.weeks && Array.isArray(result.data.weeks)) {
          setWeeks(result.data.weeks)
        } else {
          // Fallback: fetch weeks separately if not included
          const weeksResult = await api.weeks.getByCourse(courseId)
          console.log('Weeks result:', weeksResult)
          if (weeksResult.success && weeksResult.data) {
            setWeeks(Array.isArray(weeksResult.data) ? weeksResult.data : [])
          } else {
            console.error('Failed to get weeks:', weeksResult.error)
            setWeeks([])
          }
        }
      } else {
        console.error('Failed to get course:', result.error)
      }
    } catch (error) {
      console.error('Failed to load course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenVideoModal = (weekId: string, weekNumber: number) => {
    setSelectedWeekId(weekId)
    setSelectedWeekNumber(weekNumber)
    setShowVideoModal(true)
  }

  const handleCloseVideoModal = () => {
    setShowVideoModal(false)
    setSelectedWeekId(null)
    setSelectedWeekNumber(null)
  }

  const handleVideoUploadSuccess = () => {
    handleCloseVideoModal()
    loadCourseData()
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

  if (!course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Course not found</p>
        <Link href="/admin/courses" className="text-[#C81E4E] mt-2 inline-block">Back to Courses</Link>
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

      {/* Course Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl shadow-lg p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold">{course.title}</h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg opacity-90">{course.description}</p>
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-6 mt-4 sm:mt-6">
              <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                <p className="text-xs sm:text-sm opacity-90">Duration</p>
                <p className="text-base sm:text-xl font-bold">{course.duration_weeks} weeks</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                <p className="text-xs sm:text-sm opacity-90">Level</p>
                <p className="text-base sm:text-xl font-bold capitalize">{course.level}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                <p className="text-xs sm:text-sm opacity-90">Weeks</p>
                <p className="text-base sm:text-xl font-bold">{weeks.length}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleEditCourse}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white text-[#C81E4E] rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2">
            <FiEdit />
            <span>Edit Course</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap text-sm sm:text-base ${activeTab === 'info' ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]' : 'text-gray-600 hover:text-[#C81E4E]'
                }`}
            >
              Course Info
            </button>
            <button
              onClick={() => setActiveTab('weeks')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap text-sm sm:text-base ${activeTab === 'weeks' ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]' : 'text-gray-600 hover:text-[#C81E4E]'
                }`}
            >
              Weeks & Content
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap text-sm sm:text-base ${activeTab === 'students' ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]' : 'text-gray-600 hover:text-[#C81E4E]'
                }`}
            >
              Enrolled Students
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'info' && <CourseInfoTab course={course} />}
          {activeTab === 'weeks' && (
            <WeeksTab
              weeks={weeks}
              courseId={courseId}
              onOpenVideoModal={handleOpenVideoModal}
              onOpenAddWeekModal={handleOpenAddWeekModal}
              onDeleteWeek={handleDeleteWeek}
            />
          )}
          {activeTab === 'students' && <StudentsTab courseId={courseId} />}
        </div>
      </div>

      {/* Video Upload Modal */}
      {showVideoModal && selectedWeekId && selectedWeekNumber && (
        <VideoUploadModal
          weekId={selectedWeekId}
          weekNumber={selectedWeekNumber}
          courseId={courseId}
          onClose={handleCloseVideoModal}
          onSuccess={handleVideoUploadSuccess}
        />
      )}

      {/* Add Week Modal */}
      {showAddWeekModal && (
        <AddWeekModal
          courseId={courseId}
          totalWeeks={weeks.length}
          onClose={handleCloseAddWeekModal}
          onSuccess={handleAddWeekSuccess}
        />
      )}
    </div>
  )
}

function CourseInfoTab({ course }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
          <input type="text" defaultValue={course.title} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (weeks)</label>
          <input type="number" defaultValue={course.duration_weeks} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea rows={4} defaultValue={course.description} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select defaultValue={course.status} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
        <button className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg font-medium">Save Changes</button>
      </div>
    </div>
  )
}

function WeeksTab({ weeks, courseId, onOpenVideoModal, onOpenAddWeekModal, onDeleteWeek }: any) {
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null)
  const [weekVideos, setWeekVideos] = useState<{ [key: string]: Video[] }>({})
  const [loadingVideos, setLoadingVideos] = useState<{ [key: string]: boolean }>({})

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await api.videos.delete(videoId)
      if (result.success) {
        alert('Video deleted successfully!')
        // Refresh the videos for the current expanded week
        if (expandedWeekId) {
          setWeekVideos(prev => ({
            ...prev,
            [expandedWeekId]: prev[expandedWeekId]?.filter(v => v.id !== videoId) || []
          }))
        }
      } else {
        alert('Failed to delete video: ' + result.error)
      }
    } catch (error: any) {
      alert('Error deleting video: ' + error.message)
    }
  }

  const loadVideosForWeek = async (weekId: string) => {
    if (weekVideos[weekId]) {
      setExpandedWeekId(expandedWeekId === weekId ? null : weekId)
      return
    }

    setLoadingVideos(prev => ({ ...prev, [weekId]: true }))
    try {
      const result = await api.videos.getByWeek(weekId)
      console.log('Videos result:', result)
      if (result.success && result.data) {
        setWeekVideos(prev => ({
          ...prev,
          [weekId]: Array.isArray(result.data) ? result.data : []
        }))
      } else {
        console.error('Failed to get videos:', result.error)
        setWeekVideos(prev => ({ ...prev, [weekId]: [] }))
      }
    } catch (error) {
      console.error('Error loading videos:', error)
      setWeekVideos(prev => ({ ...prev, [weekId]: [] }))
    } finally {
      setLoadingVideos(prev => ({ ...prev, [weekId]: false }))
      setExpandedWeekId(expandedWeekId === weekId ? null : weekId)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Course Weeks ({weeks.length})</h2>
        <button
          onClick={onOpenAddWeekModal}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
          <FiPlus />
          <span>Add Week</span>
        </button>
      </div>

      {weeks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          <p>No weeks added yet. Create the first week to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week: any) => (
            <div key={week.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Week {week.week_number}: {week.title}
                    </h3>
                    {week.locked ? (
                      <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center space-x-1">
                        <FiLock className="text-xs sm:text-sm" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                        <FiUnlock className="text-xs sm:text-sm" />
                        <span>Unlocked</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Created: {new Date(week.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${week.locked
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                  >
                    <span className="hidden sm:inline">{week.locked ? 'Unlock' : 'Lock'} Week</span>
                    <span className="sm:hidden">{week.locked ? 'Unlock' : 'Lock'}</span>
                  </button>
                  <button
                    onClick={() => loadVideosForWeek(week.id)}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm font-medium flex items-center justify-center space-x-1 ${expandedWeekId === week.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    <FiVideo className="text-xs sm:text-sm" />
                    <span>{loadingVideos[week.id] ? 'Loading...' : 'Videos'}</span>
                  </button>
                  <button
                    onClick={() => onOpenVideoModal(week.id, week.week_number)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs sm:text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <FiPlus className="text-xs sm:text-sm" />
                    <span>Upload</span>
                  </button>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-medium flex items-center justify-center">
                      <FiEdit />
                    </button>
                    <button 
                      onClick={() => onDeleteWeek(week.id, week.title)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>

              {/* Videos List */}
              {expandedWeekId === week.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4">Videos in this week</h4>
                  {loadingVideos[week.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C81E4E]"></div>
                    </div>
                  ) : weekVideos[week.id] && weekVideos[week.id].length > 0 ? (
                    <div className="space-y-3">
                      {weekVideos[week.id].map((video: Video) => (
                        <div key={video.id} className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">{video.title}</h5>
                            {video.description && (
                              <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                              {video.duration_minutes && (
                                <span>Duration: {video.duration_minutes} mins</span>
                              )}
                              <span>Added: {new Date(video.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <a
                              href={video.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-none text-center px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              View
                            </a>
                            <button 
                              onClick={() => handleDeleteVideo(video.id, video.title)}
                              className="flex-1 sm:flex-none px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                      <p>No videos uploaded yet. Click "Upload" to add a video.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StudentsTab({ courseId }: { courseId: string }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        console.log('🔄 Loading enrollments for course:', courseId)
        const res = await api.courses.getEnrollments(courseId)
        console.log('📥 Enrollments API response:', res)
        if (res.success && Array.isArray(res.data)) {
          setEnrollments(res.data)
          console.log('✅ Loaded enrollments:', res.data)
        } else {
          setEnrollments([])
          console.warn('⚠️ No enrollments or invalid response:', res)
        }
      } catch (err) {
        console.error('❌ Failed to load enrollments', err)
        setEnrollments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Enrolled Students ({enrollments.length})</h2>
        <input
          type="text"
          placeholder="Search students..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
        />
      </div>

      {loading ? (
        <div className="text-center p-6 text-gray-600">Loading enrolled students...</div>
      ) : enrollments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          <p>No students enrolled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {enrollments.map((e: any) => (
            <div key={e.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{e.user?.full_name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500 mt-1">{e.user?.email || '-'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">Enrolled: {new Date(e.enrolled_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
