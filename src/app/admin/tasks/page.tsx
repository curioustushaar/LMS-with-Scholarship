'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiCheckSquare, FiFilter } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Task {
  id: string
  title: string
  description: string
  deadline: string
  status: string
  max_points: number
  created_at: string
}

interface Course {
  id: string
  title: string
  code: string
  status: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    loadCourses()
    loadTasks()
  }, [])

  useEffect(() => {
    loadTasks()
  }, [selectedCourse, statusFilter])

  const loadCourses = async () => {
    try {
      const result = await api.courses.getAll()
      if (result.success && result.data) {
        setCourses(Array.isArray(result.data) ? result.data : [])
      }
    } catch (err) {
      console.error('Failed to load courses:', err)
    }
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      console.log('Loading tasks...')
      
      const filters: any = {}
      if (selectedCourse) filters.course_id = selectedCourse
      if (statusFilter) filters.status = statusFilter
      
      const result = await api.tasks.getAll(filters)
      console.log('Tasks result:', result)
      if (result.success && result.data) {
        setTasks(Array.isArray(result.data) ? result.data : [])
      } else {
        console.error('Task loading failed:', result.error)
        setTasks([])
      }
      setError('')
    } catch (err: any) {
      setError('Failed to load tasks')
      console.error('Task loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      await api.tasks.delete(id)
      setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tasks & Assignments</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-sm sm:text-base text-gray-600">Manage tasks and student submissions</p>
            {(selectedCourse || statusFilter) && (
              <>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                      Course: {courses.find(c => c.id === selectedCourse)?.title || 'Selected'}
                    </span>
                  )}
                  {statusFilter && (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                      Status: {statusFilter}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <Link
          href="/admin/tasks/create"
          className="w-full sm:w-auto bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <FiPlus className="text-lg sm:text-xl" />
          <span>Create Task</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-6">
        <div className="flex items-start md:items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm sm:text-base">
            <FiFilter className="text-base sm:text-lg" />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
            {/* Course Filter */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent outline-none w-full text-sm sm:text-base"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent outline-none w-full text-sm sm:text-base"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedCourse || statusFilter) && (
            <button
              onClick={() => {
                setSelectedCourse('')
                setStatusFilter('')
              }}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap mt-2 sm:mt-0"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Tasks</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium">Active Tasks</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{tasks.filter(t => t.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium">Draft Tasks</p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">{tasks.filter(t => t.status === 'draft').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <p className="text-gray-600 text-xs sm:text-sm font-medium">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
      </div>

      {/* Tasks Grid/Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-4 text-left font-semibold text-gray-800">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">Due Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">Points</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{task.max_points} pts</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'active' ? 'bg-green-100 text-green-800' :
                        task.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/tasks/${task.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{task.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === 'active' ? 'bg-green-100 text-green-800' :
                    task.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                  {task.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-600">
                  <span className="text-xs block text-gray-400">Due Date</span>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </div>
                <div className="text-right">
                  <span className="text-xs block text-gray-400">Points</span>
                  <span className="font-bold text-[#C81E4E]">{task.max_points}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/admin/tasks/${task.id}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                  <FiEdit size={14} />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tasks.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FiCheckSquare className="text-5xl text-gray-300 mx-auto mb-4" />
          {(selectedCourse || statusFilter) ? (
            <div>
              <p className="text-gray-500 text-lg mb-4">No tasks found with current filters</p>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or create a new task</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSelectedCourse('')
                    setStatusFilter('')
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
                <Link href="/admin/tasks/create" className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
                  <FiPlus />
                  Create Task
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-lg mb-4">No tasks found</p>
              <Link href="/admin/tasks/create" className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
                <FiPlus />
                Create First Task
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
