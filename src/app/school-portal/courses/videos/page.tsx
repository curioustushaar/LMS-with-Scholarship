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

export default function SchoolVideosPage() {
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
      console.log('School Portal courses:', coursesResult)

      if (coursesResult.success && coursesResult.data) {
        const courses = Array.isArray(coursesResult.data) ? coursesResult.data : []
        const coursesWithVideos: CourseVideos[] = []

        for (const course of courses) {
          try {
            // Get weeks for this course
            const weeksResult = await api.weeks.getByCourse(course.id)
            let weeks = weeksResult.success && weeksResult.data 
              ? (Array.isArray(weeksResult.data) ? weeksResult.data : [])
              : []

            // If no weeks exist for this course yet, create default Week 1 so partner can immediately upload
            if (weeks.length === 0) {
              try {
                const autoWeek = await api.weeks.create({
                  course_id: course.id,
                  week_number: 1,
                  title: 'Module 1: Orientation & Foundations',
                  description: 'Core introductory lectures and essential walkthroughs'
                })
                if (autoWeek.success && autoWeek.data) {
                  weeks = [autoWeek.data]
                }
              } catch (weekErr) {
                console.warn('Auto week creation notice:', weekErr)
              }
            }

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
        if (coursesWithVideos.length > 0 && expandedCourses.length === 0) {
          setExpandedCourses([coursesWithVideos[0].course.id])
        }
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
    setShowAddVideoModal(false)
    loadAllCoursesData()
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This will remove it from the database and storage.')) return

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

  const handleAddWeek = async (courseId: string, currentWeeksCount: number) => {
    const nextWeekNumber = currentWeeksCount + 1
    const title = prompt(`Enter title for Week ${nextWeekNumber}:`, `Week ${nextWeekNumber} Lectures`)
    if (!title || !title.trim()) return

    try {
      const res = await api.weeks.create({
        course_id: courseId,
        week_number: nextWeekNumber,
        title: title.trim(),
        description: `Week ${nextWeekNumber} lectures and materials`
      })
      if (res.success) {
        loadAllCoursesData()
      } else {
        alert('Failed to create week: ' + (res.error || 'Unknown error'))
      }
    } catch (e: any) {
      alert('Error creating week: ' + e.message)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2D8D] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading course videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/10 inline-block mb-2">
            Institutional Partner Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">🎬 Course Video Lectures</h1>
          <p className="mt-1 text-sm text-purple-200">Upload and manage video curriculum and study material for your students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
            <p className="text-[11px] text-purple-200 font-semibold uppercase">Assigned Courses</p>
            <p className="text-xl font-bold">{filteredCourses.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
            <p className="text-[11px] text-purple-200 font-semibold uppercase">Total Videos</p>
            <p className="text-xl font-bold">
              {filteredCourses.reduce((sum, item) => sum + getTotalVideos(item), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search assigned courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2D8D] shadow-sm"
        />
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
            <p className="text-3xl mb-2">📚</p>
            <p className="text-base font-bold text-gray-700">No courses currently available</p>
            <p className="text-xs text-gray-500 mt-1">Please contact platform Superadmin to assign courses to your institution.</p>
          </div>
        ) : (
          filteredCourses.map((courseData) => (
            <div key={courseData.course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Course Header */}
              <button
                onClick={() => toggleCourseExpand(courseData.course.id)}
                className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-white hover:bg-gray-100/70 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">{courseData.course.title}</h2>
                  {courseData.course.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{courseData.course.description}</p>
                  )}
                  <div className="flex items-center gap-2.5 mt-2.5">
                    <span className="text-[11px] bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-md font-semibold border border-purple-200">
                      📚 {courseData.weeks.length} weeks
                    </span>
                    <span className="text-[11px] bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-md font-semibold border border-pink-200">
                      🎬 {getTotalVideos(courseData)} videos
                    </span>
                  </div>
                </div>
                <div className={`text-xl text-gray-400 transition-transform duration-300 ${expandedCourses.includes(courseData.course.id) ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              {/* Expanded Content */}
              {expandedCourses.includes(courseData.course.id) && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Weekly Lecture Modules</h3>
                    <button
                      onClick={() => handleAddWeek(courseData.course.id, courseData.weeks.length)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1.5"
                    >
                      <FiPlus />
                      Add Next Week Module
                    </button>
                  </div>

                  {courseData.weeks.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                      <p className="text-2xl mb-1">📅</p>
                      <p className="text-sm font-bold text-gray-700">No weeks configured</p>
                      <button
                        onClick={() => handleAddWeek(courseData.course.id, 0)}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold"
                      >
                        Create Week 1
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseData.weeks.map((week) => (
                        <div key={week.id} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
                          {/* Week Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                📅 Week {week.week_number}: {week.title}
                              </h4>
                              {week.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{week.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openUploadModal(courseData.course.id, week.id, week.week_number)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                              >
                                <FiPlus />
                                <span>Upload Video</span>
                              </button>
                              <button
                                onClick={() => openAddVideoModal(courseData.course.id, week.id, week.week_number)}
                                className="px-3.5 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <FiLink />
                                <span>Add Link</span>
                              </button>
                            </div>
                          </div>

                          {/* Video List */}
                          {courseData.videos[week.id] && courseData.videos[week.id].length > 0 ? (
                            <div className="space-y-2.5">
                              {courseData.videos[week.id].map((video) => (
                                <div key={video.id} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{video.title}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                                      {video.duration_minutes && <span>⏱️ {video.duration_minutes} min</span>}
                                      <span>📅 {new Date(video.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <a
                                      href={video.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 font-semibold flex items-center gap-1"
                                    >
                                      <FiExternalLink />
                                      View
                                    </a>
                                    <button
                                      onClick={() => handleDeleteVideo(video.id)}
                                      className="p-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete video"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic text-center py-2">
                              No videos uploaded for this week yet.
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

