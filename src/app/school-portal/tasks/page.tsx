'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiCheckSquare, FiFilter, FiCalendar, FiBookOpen } from 'react-icons/fi'
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
  code?: string
  status?: string
}

export default function SchoolTasksPage() {
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
      const filters: any = {}
      if (selectedCourse) filters.course_id = selectedCourse
      if (statusFilter) filters.status = statusFilter
      
      const result = await api.tasks.getAll(filters)
      if (result.success && result.data) {
        setTasks(Array.isArray(result.data) ? result.data : [])
      } else {
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
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      const res = await api.tasks.delete(id)
      if (res.success) {
        setTasks(tasks.filter(t => t.id !== id))
      } else {
        alert(res.error || 'Failed to delete task')
      }
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2D8D] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading tasks & assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/10 inline-block mb-2">
            Academic Tasks
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">📝 Tasks & Assignments</h1>
          <p className="mt-1 text-sm text-purple-200">Create, evaluate and manage student assignments for your courses</p>
        </div>
        <Link
          href="/school-portal/tasks/create"
          className="px-5 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <FiPlus className="text-base" />
          <span>Create Task</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700 font-bold text-xs">
            <FiFilter />
            <span>Filter Tasks:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
            >
              <option value="">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>

            {(selectedCourse || statusFilter) && (
              <button
                onClick={() => { setSelectedCourse(''); setStatusFilter('') }}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FiCheckSquare className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">No tasks created yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Click below to create your first course task for students</p>
            <Link
              href="/school-portal/tasks/create"
              className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <FiPlus />
              Create Task
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 uppercase tracking-wider text-gray-500 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Task Title</th>
                  <th className="px-5 py-3.5">Deadline</th>
                  <th className="px-5 py-3.5">Points</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 text-sm">{task.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{task.description}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                    </td>
                    <td className="px-5 py-4 font-bold text-purple-700">
                      {task.max_points} pts
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        task.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                        task.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        title="Delete task"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

