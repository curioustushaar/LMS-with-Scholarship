'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { superadminAPI } from '@/lib/api'
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiCheckSquare,
  FiFileText,
  FiMessageSquare,
  FiTrendingUp,
  FiActivity,
} from 'react-icons/fi'
import Link from 'next/link'

interface Analytics {
  overview: {
    total_admins: number
    total_students: number
    total_courses: number
    total_tasks: number
    total_projects: number
    total_tickets: number
    pending_tickets: number
    pending_projects: number
  }
  recent_activity: Array<{
    date: string
    courses_added: number
    students_added: number
    projects_evaluated: number
    tasks_created: number
    tickets_resolved: number
  }>
  top_admins: Array<{
    admin_id: string
    email: string
    full_name: string
    assigned_courses_count: number
    assigned_students_count: number
    assigned_tasks_count: number
    assigned_projects_count: number
    total_students_added: number
    total_projects_evaluated: number
    total_tickets_resolved: number
    total_courses_added: number
    active_days: number
  }>
}

export default function SuperadminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    const response = await superadminAPI.getAnalytics()
    if (response.success) {
      setAnalytics(response.data)
    } else {
      console.error('Failed to fetch analytics:', response.error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Admins',
      value: analytics?.overview.total_admins || 0,
      icon: FiUserCheck,
      color: 'from-purple-500 to-purple-600',
      link: '/superadmin/admins',
    },
    {
      name: 'Total Students',
      value: analytics?.overview.total_students || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Total Courses',
      value: analytics?.overview.total_courses || 0,
      icon: FiBookOpen,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Total Tasks',
      value: analytics?.overview.total_tasks || 0,
      icon: FiCheckSquare,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      name: 'Total Projects',
      value: analytics?.overview.total_projects || 0,
      icon: FiFileText,
      color: 'from-[#C81E4E] to-[#D91E5B]',
    },
    {
      name: 'Pending Projects',
      value: analytics?.overview.pending_projects || 0,
      icon: FiActivity,
      color: 'from-orange-500 to-orange-600',
    },
    {
      name: 'Total Tickets',
      value: analytics?.overview.total_tickets || 0,
      icon: FiMessageSquare,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      name: 'Pending Tickets',
      value: analytics?.overview.pending_tickets || 0,
      icon: FiTrendingUp,
      color: 'from-red-500 to-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Superadmin Dashboard</h1>
        <p className="text-white/90">Complete system overview and admin management</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const StatIcon = stat.icon
          const content = (
            <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-transparent hover:border-[#C81E4E] transition-all ${stat.link ? 'cursor-pointer hover:shadow-lg' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <StatIcon className="text-2xl text-white" />
                </div>
              </div>
            </div>
          )
          
          return stat.link ? (
            <Link key={stat.name} href={stat.link}>
              {content}
            </Link>
          ) : (
            <div key={stat.name}>{content}</div>
          )
        })}
      </div>

      {/* Top Performing Admins */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Top Performing Admins</h2>
          <Link
            href="/superadmin/admins"
            className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Admin</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Courses</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Students</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tasks</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Projects</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tickets</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Active Days</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.top_admins.slice(0, 5).map((admin, index) => (
                <tr key={admin.admin_id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${index === 0 ? 'from-yellow-400 to-yellow-500' : index === 1 ? 'from-gray-300 to-gray-400' : index === 2 ? 'from-orange-400 to-orange-500' : 'from-gray-200 to-gray-300'} flex items-center justify-center text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{admin.full_name}</p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {admin.assigned_courses_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {admin.assigned_students_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                      {admin.assigned_tasks_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {admin.assigned_projects_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {admin.total_tickets_resolved}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-gray-700 font-medium">{admin.active_days}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!analytics?.top_admins || analytics.top_admins.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <FiUsers className="text-5xl mx-auto mb-3 opacity-50" />
            <p>No admin activity data available yet</p>
          </div>
        )}
      </div>

      {/* Recent Activity Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent System Activity (Last 7 Days)</h2>
        
        <div className="space-y-4">
          {analytics?.recent_activity.slice(0, 7).map((activity) => (
            <div key={activity.date} className="border-l-4 border-[#C81E4E] pl-4 py-2">
              <p className="font-semibold text-gray-900 mb-2">
                {new Date(activity.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="bg-green-50 px-3 py-2 rounded">
                  <p className="text-gray-600">Courses</p>
                  <p className="font-bold text-green-700">{activity.courses_added}</p>
                </div>
                <div className="bg-blue-50 px-3 py-2 rounded">
                  <p className="text-gray-600">Students</p>
                  <p className="font-bold text-blue-700">{activity.students_added}</p>
                </div>
                <div className="bg-purple-50 px-3 py-2 rounded">
                  <p className="text-gray-600">Projects</p>
                  <p className="font-bold text-purple-700">{activity.projects_evaluated}</p>
                </div>
                <div className="bg-yellow-50 px-3 py-2 rounded">
                  <p className="text-gray-600">Tasks</p>
                  <p className="font-bold text-yellow-700">{activity.tasks_created}</p>
                </div>
                <div className="bg-red-50 px-3 py-2 rounded">
                  <p className="text-gray-600">Tickets</p>
                  <p className="font-bold text-red-700">{activity.tickets_resolved}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!analytics?.recent_activity || analytics.recent_activity.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <FiActivity className="text-5xl mx-auto mb-3 opacity-50" />
            <p>No recent activity data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
