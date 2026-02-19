'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiClock, FiCalendar } from 'react-icons/fi'

interface Task {
  id: string
  title: string  
  description?: string
  deadline: string | null
  status: string
  max_points: number
  courses?: {
    title: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetchTasks = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        // Fetch tasks using the student API
        const response = await fetch('/api/student/tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setTasks(result.data)
        } else {
          setError('No tasks found')
        }
      } catch (err: any) {
        console.error('Error fetching tasks:', err)
        setError(err.message || 'Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchTasks()
  }, [router])

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline'
    
    try {
      const date = new Date(deadline)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric', 
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getTaskStatus = (deadline: string | null) => {
    if (!deadline) return 'no-deadline'
    
    try {
      const dueDate = new Date(deadline)
      if (isNaN(dueDate.getTime())) return 'invalid-date'
      
      const now = new Date()
      const timeDiff = dueDate.getTime() - now.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
      
      if (daysDiff < 0) return 'overdue'
      if (daysDiff <= 2) return 'due-soon'
      return 'upcoming'
    } catch {
      return 'invalid-date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bireena Edutech</h1>
          <p className="text-gray-600 mt-1">Your task dashboard</p>
        </div>

        {/* Navigation Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Dashboard</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Internship</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Learning Modules</a>
                <a href="#" className="block px-4 py-2 bg-[#C81E4E] text-white rounded font-medium">Tasks</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Projects</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Badges</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Certificates</a>
                <a href="#" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">Support</a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Current Week Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Week Tasks</h2>
              
              {tasks.length === 0 ? (
                <p className="text-gray-500">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.courses?.title || 'Unknown Course'}</h3>
                        <div className="flex items-center mt-2 text-sm text-red-500">
                          <FiCalendar className="mr-1" />
                          {formatDeadline(task.deadline)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          PENDING
                        </span>
                        <button className="px-4 py-2 bg-[#C81E4E] text-white text-sm font-medium rounded hover:bg-[#A01840] transition-colors">
                          Upload
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Task Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Task Overview</h2>
              
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.courses?.title || 'Unknown Course'}</h3>
                      <div className="flex items-center mt-2 text-sm text-red-500">
                        <FiCalendar className="mr-1" />
                        {formatDeadline(task.deadline)}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      getTaskStatus(task.deadline) === 'overdue' ? 'bg-red-100 text-red-800' :
                      getTaskStatus(task.deadline) === 'due-soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      PENDING
                    </span>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && (
                <div className="text-center py-8">
                  <FiClock className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading at bottom */}
        {tasks.length > 0 && (
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-500 bg-white rounded-lg p-4 max-w-xs mx-auto">
              Loading...
              <br />
              <span className="text-xs">robotics</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}