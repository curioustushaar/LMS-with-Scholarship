'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiBook, FiClock, FiVideo, FiFileText } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Course {
  id: string
  title: string
  description: string
  domain: string
  level: string
  duration_weeks: number
  status: string
  enrolled_at: string
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      const result = await api.student.courses.getAll()
      if (result.success && result.data) {
        setCourses(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error('Failed to load enrolled courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Courses</h1>
        <p className="text-gray-600 mt-2">View and access your enrolled courses</p>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FiBook className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h2>
          <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
          <p className="text-sm text-gray-500">Contact your administrator to get enrolled in courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Course Header */}
              <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <div className="flex items-center space-x-4 text-sm opacity-90">
                  <span className="flex items-center">
                    <FiClock className="mr-1" />
                    {course.duration_weeks} weeks
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded text-xs">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Course Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                <div className="mb-4">
                  <span className="text-xs text-gray-500">Domain:</span>
                  <span className="ml-2 text-sm font-medium text-gray-700">{course.domain}</span>
                </div>

                <div className="mb-6">
                  <span className="text-xs text-gray-500">Enrolled:</span>
                  <span className="ml-2 text-sm text-gray-700">
                    {new Date(course.enrolled_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    href="/student/videos"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#C81E4E] text-white rounded-lg hover:bg-[#D91E5B] transition-colors"
                  >
                    <FiVideo />
                    <span>Watch Videos</span>
                  </Link>
                  <Link
                    href="/student/projects"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiFileText />
                    <span>View Projects</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
