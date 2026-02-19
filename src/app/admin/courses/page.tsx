'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiArchive, FiEye } from 'react-icons/fi'
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

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, students: 0, videos: 0 })
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState<string | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  const handleEdit = (courseId: string) => {
    router.push(`/admin/courses/${courseId}/edit`)
  }

  const handleArchive = async (courseId: string) => {
    if (!confirm('Are you sure you want to archive this course?')) return
    
    try {
      setArchiving(courseId)
      const result = await api.courses.update(courseId, { status: 'archived' })
      if (result.success) {
        // Update local state
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'archived' } : c))
        alert('Course archived successfully')
      } else {
        alert('Failed to archive course: ' + result.error)
      }
    } catch (error) {
      console.error('Error archiving course:', error)
      alert('Error archiving course')
    } finally {
      setArchiving(null)
    }
  }

  const loadCourses = async () => {
    try {
      // Fetch courses
      const coursesResult = await api.courses.getAll()
      const coursesData = coursesResult.success && coursesResult.data 
        ? (Array.isArray(coursesResult.data) ? coursesResult.data : []) 
        : []
      
      setCourses(coursesData)
      
      // Count students enrolled (from users table with role='student')
      const studentsResult = await api.students.getAll()
      const studentCount = studentsResult.success && Array.isArray(studentsResult.data) 
        ? studentsResult.data.length 
        : 0
      
      // For now, videos count is 0 (would need to aggregate from videos table)
      const total = coursesData.length
      const active = coursesData.filter((c: any) => c.status === 'active').length
      const draft = coursesData.filter((c: any) => c.status === 'draft').length
      
      console.log('📊 Courses loaded:', { total, active, draft, students: studentCount })
      
      setStats({
        total,
        active,
        students: studentCount,
        videos: 0
      })
    } catch (error) {
      console.error('Failed to load courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Courses & Content</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage courses, weeks, and learning materials</p>
        </div>
        <button 
          onClick={() => router.push('/admin/courses/create')}
          className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm md:text-base">
          <FiPlus className="text-lg md:text-xl" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Active Courses</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.students}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Videos</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.videos}</p>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No courses found. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
                <h2 className="text-2xl font-bold">{course.title}</h2>
                <p className="mt-2 opacity-90">{course.duration_weeks} weeks • {course.level}</p>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description || 'No description'}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' : 
                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                  <span className="text-xs text-gray-500">Created: {new Date(course.created_at).toLocaleDateString()}</span>
                </div>

              <div className="grid grid-cols-3 gap-3">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium text-center flex items-center justify-center space-x-1"
                >
                  <FiEye />
                  <span>View</span>
                </Link>
                <button 
                  onClick={() => handleEdit(course.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <FiEdit />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleArchive(course.id)}
                  disabled={archiving === course.id}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-medium flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiArchive />
                  <span>{archiving === course.id ? 'Archiving...' : 'Archive'}</span>
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
