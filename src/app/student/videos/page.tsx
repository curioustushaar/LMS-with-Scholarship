'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiArrowLeft, FiPlay, FiWatch, FiClock, FiCalendar, FiDownload } from 'react-icons/fi'
import Link from 'next/link'
import { api } from '@/lib/api'

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
  weeks?: Week[]
}

interface CourseVideos {
  course: Course
  weeks: Week[]
  videos: { [weekId: string]: Video[] }
}

export default function StudentVideosPage() {
  const [courseVideos, setCourseVideos] = useState<CourseVideos[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  useEffect(() => {
    loadStudentCourses()
  }, [])

  const loadStudentCourses = async () => {
    try {
      setLoading(true)
      
      // Fetch student's enrolled courses
      const coursesResult = await api.student.courses.getAll()
      if (!coursesResult.success || !coursesResult.data) {
        console.warn('No enrolled courses found')
        setCourseVideos([])
        setLoading(false)
        return
      }

      const courses = Array.isArray(coursesResult.data) ? coursesResult.data : []
        const coursesWithVideos: CourseVideos[] = []

        for (const course of courses) {
          try {
            const weeksResult = await api.weeks.getByCourse(course.id)
            const weeks = weeksResult.success && weeksResult.data 
              ? (Array.isArray(weeksResult.data) ? weeksResult.data : [])
              : []

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
            console.error(`Error loading course ${course.id}:`, err)
          }
        }

        setCourseVideos(coursesWithVideos)
        if (coursesWithVideos.length > 0) {
          setSelectedCourse(coursesWithVideos[0].course.id)
        }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalVideos = (courseData: CourseVideos) => {
    return Object.values(courseData.videos).reduce((sum, videos) => sum + videos.length, 0)
  }

  const selectedCourseData = courseVideos.find(item => item.course.id === selectedCourse)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">📹 Course Videos</h1>
        <p className="text-gray-600 mt-2">Watch videos from your enrolled courses</p>
      </div>

      {courseVideos.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FiWatch className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h2>
          <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
          <Link href="/student/courses" className="inline-block px-6 py-3 bg-[#C81E4E] text-white rounded-lg hover:bg-[#D91E5B] transition-colors font-semibold">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
              <h2 className="font-bold text-gray-800 mb-4">Your Courses</h2>
              <div className="space-y-2">
                {courseVideos.map((item) => (
                  <button
                    key={item.course.id}
                    onClick={() => setSelectedCourse(item.course.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCourse === item.course.id
                        ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-semibold truncate">{item.course.title}</h3>
                    <p className="text-xs opacity-75 mt-1">
                      {getTotalVideos(item)} videos
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="lg:col-span-3">
            {selectedCourseData && (
              <div className="space-y-6">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl p-8 shadow-lg">
                  <h1 className="text-3xl font-bold">{selectedCourseData.course.title}</h1>
                  <p className="mt-3 opacity-90">{selectedCourseData.course.description}</p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-xs opacity-75">Level</p>
                      <p className="font-bold capitalize">{selectedCourseData.course.level}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-xs opacity-75">Duration</p>
                      <p className="font-bold">{selectedCourseData.course.duration_weeks} weeks</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-xs opacity-75">Total Videos</p>
                      <p className="font-bold">{getTotalVideos(selectedCourseData)}</p>
                    </div>
                  </div>
                </div>

                {/* Weeks & Videos */}
                <div className="space-y-4">
                  {selectedCourseData.weeks.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
                      <p>No weeks available in this course</p>
                    </div>
                  ) : (
                    selectedCourseData.weeks.map((week) => {
                      const weekVideos = selectedCourseData.videos[week.id] || []
                      return (
                        <div key={week.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                          {/* Week Header */}
                          <div className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">
                              Week {week.week_number}: {week.title}
                            </h2>
                            {week.description && (
                              <p className="text-sm text-gray-600 mt-2">{week.description}</p>
                            )}
                          </div>

                          {/* Videos Grid */}
                          {weekVideos.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                              <FiPlay className="text-3xl text-gray-300 mx-auto mb-2" />
                              <p>No videos in this week yet</p>
                            </div>
                          ) : (
                            <div className="p-6 space-y-4">
                              {weekVideos.map((video) => (
                                <div key={video.id} className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                        {video.title}
                                      </h3>
                                      {video.description && (
                                        <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        {video.duration_minutes && (
                                          <div className="flex items-center space-x-1">
                                            <FiClock className="w-4 h-4" />
                                            <span>{video.duration_minutes} minutes</span>
                                          </div>
                                        )}
                                        <div className="flex items-center space-x-1">
                                          <FiCalendar className="w-4 h-4" />
                                          <span>Added {new Date(video.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                      <a
                                        href={video.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-semibold whitespace-nowrap"
                                      >
                                        <FiPlay className="w-5 h-5" />
                                        <span>Watch</span>
                                      </a>
                                      <a
                                        href={video.video_url}
                                        download={video.title}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center space-x-2 font-semibold whitespace-nowrap"
                                      >
                                        <FiDownload className="w-5 h-5" />
                                        <span>Download</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
