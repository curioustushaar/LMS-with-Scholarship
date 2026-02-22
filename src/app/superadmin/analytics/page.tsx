'use client'

import { useEffect, useState } from 'react'
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
  FiCalendar,
  FiAward,
  FiBarChart2,
} from 'react-icons/fi'

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

export default function SuperadminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7days')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      console.log('📊 Fetching analytics data...')
      const response = await superadminAPI.getAnalytics()
      console.log('📊 Analytics API Response:', response)
      
      if (response.success) {
        console.log('✅ Analytics data loaded:', response.data)
        setAnalytics(response.data)
      } else {
        console.error('❌ Failed to fetch analytics:', response.error)
        alert(`Failed to load analytics: ${response.error}`)
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      alert(`Error loading analytics: ${error}`)
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

  const overviewStats = [
    {
      name: 'Total Admins',
      value: analytics?.overview.total_admins || 0,
      icon: FiUserCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Total Students',
      value: analytics?.overview.total_students || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+23%',
      changeType: 'increase',
    },
    {
      name: 'Total Courses',
      value: analytics?.overview.total_courses || 0,
      icon: FiBookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Total Tasks',
      value: analytics?.overview.total_tasks || 0,
      icon: FiCheckSquare,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      change: '+15%',
      changeType: 'increase',
    },
    {
      name: 'Total Projects',
      value: analytics?.overview.total_projects || 0,
      icon: FiFileText,
      color: 'from-[#C81E4E] to-[#D91E5B]',
      bgColor: 'bg-pink-50',
      iconColor: 'text-[#C81E4E]',
      change: '+18%',
      changeType: 'increase',
    },
    {
      name: 'Pending Projects',
      value: analytics?.overview.pending_projects || 0,
      icon: FiActivity,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      change: '-5%',
      changeType: 'decrease',
    },
    {
      name: 'Total Tickets',
      value: analytics?.overview.total_tickets || 0,
      icon: FiMessageSquare,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      change: '+10%',
      changeType: 'increase',
    },
    {
      name: 'Pending Tickets',
      value: analytics?.overview.pending_tickets || 0,
      icon: FiTrendingUp,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      change: '-8%',
      changeType: 'decrease',
    },
  ]

  // Calculate activity summaries
  const activitySummary = analytics?.recent_activity.reduce(
    (acc, activity) => ({
      total_courses: acc.total_courses + (activity.courses_added || 0),
      total_students: acc.total_students + (activity.students_added || 0),
      total_projects: acc.total_projects + (activity.projects_evaluated || 0),
      total_tasks: acc.total_tasks + (activity.tasks_created || 0),
      total_tickets: acc.total_tickets + (activity.tickets_resolved || 0),
    }),
    {
      total_courses: 0,
      total_students: 0,
      total_projects: 0,
      total_tasks: 0,
      total_tickets: 0,
    }
  ) || {
    total_courses: 0,
    total_students: 0,
    total_projects: 0,
    total_tasks: 0,
    total_tickets: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Analytics</h1>
            <p className="text-white/90">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <FiBarChart2 className="text-5xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-700">
            <FiCalendar className="text-xl" />
            <span className="font-semibold">Time Range:</span>
          </div>
          <div className="flex space-x-2">
            {['7days', '30days', '90days', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-[#C81E4E] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : range === '90days' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-[#C81E4E]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <span
                      className={`font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <StatIcon className={`text-2xl ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Courses Added</h3>
            <FiBookOpen className="text-xl text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activitySummary.total_courses}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Students Added</h3>
            <FiUsers className="text-xl text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activitySummary.total_students}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Projects Evaluated</h3>
            <FiFileText className="text-xl text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activitySummary.total_projects}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Tasks Created</h3>
            <FiCheckSquare className="text-xl text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activitySummary.total_tasks}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#C81E4E]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Tickets Resolved</h3>
            <FiMessageSquare className="text-xl text-[#C81E4E]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activitySummary.total_tickets}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiActivity className="mr-2 text-[#C81E4E]" />
            Recent System Activity
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics?.recent_activity.slice(0, 7).map((activity, index) => (
              <div key={activity.date} className="border-l-4 border-[#C81E4E] pl-4 py-3 bg-gray-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <span className="text-xs bg-[#C81E4E] text-white px-2 py-1 rounded-full">
                    {index === 0 ? 'Today' : `${index} ${index === 1 ? 'day' : 'days'} ago`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <FiBookOpen className="text-purple-500" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{activity.courses_added}</span> Courses
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiUsers className="text-blue-500" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{activity.students_added}</span> Students
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiFileText className="text-green-500" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{activity.projects_evaluated}</span> Projects
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheckSquare className="text-yellow-500" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{activity.tasks_created}</span> Tasks
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMessageSquare className="text-[#C81E4E]" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{activity.tickets_resolved}</span> Tickets
                    </span>
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

        {/* Top Performing Admins */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiAward className="mr-2 text-[#C81E4E]" />
            Top Performing Admins
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics?.top_admins.slice(0, 5).map((admin, index) => (
              <div
                key={admin.admin_id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    index === 0
                      ? 'from-yellow-400 to-yellow-500'
                      : index === 1
                      ? 'from-gray-300 to-gray-400'
                      : index === 2
                      ? 'from-orange-400 to-orange-500'
                      : 'from-gray-200 to-gray-300'
                  } flex items-center justify-center text-white font-bold text-lg shadow-md`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{admin.full_name}</p>
                  <p className="text-xs text-gray-500">{admin.email}</p>
                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {admin.assigned_courses_count} Courses
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {admin.assigned_students_count} Students
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {admin.assigned_projects_count} Projects
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Activity</p>
                  <p className="text-2xl font-bold text-[#C81E4E]">{admin.active_days}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>
            ))}
          </div>

          {(!analytics?.top_admins || analytics.top_admins.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <FiUserCheck className="text-5xl mx-auto mb-3 opacity-50" />
              <p>No admin performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FiTrendingUp className="mr-2 text-[#C81E4E]" />
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-purple-900">Admin Efficiency</h3>
              <FiUserCheck className="text-2xl text-purple-600" />
            </div>
            <p className="text-4xl font-bold text-purple-900 mb-2">
              {analytics?.top_admins.length
                ? Math.round(
                    analytics.top_admins.reduce((sum, admin) => sum + admin.active_days, 0) /
                      analytics.top_admins.length
                  )
                : 0}
            </p>
            <p className="text-sm text-purple-700">Avg. Active Days</p>
            <div className="mt-4 bg-purple-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-blue-900">Course Completion</h3>
              <FiBookOpen className="text-2xl text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-blue-900 mb-2">
              {analytics?.overview.total_courses
                ? Math.round((activitySummary.total_courses / analytics.overview.total_courses) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-blue-700">Recently Active</p>
            <div className="mt-4 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${
                    analytics?.overview.total_courses
                      ? Math.min((activitySummary.total_courses / analytics.overview.total_courses) * 100, 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-green-900">Ticket Resolution</h3>
              <FiMessageSquare className="text-2xl text-green-600" />
            </div>
            <p className="text-4xl font-bold text-green-900 mb-2">
              {analytics?.overview.total_tickets
                ? Math.round(
                    ((analytics.overview.total_tickets - analytics.overview.pending_tickets) /
                      analytics.overview.total_tickets) *
                      100
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-green-700">Resolution Rate</p>
            <div className="mt-4 bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    analytics?.overview.total_tickets
                      ? Math.round(
                          ((analytics.overview.total_tickets - analytics.overview.pending_tickets) /
                            analytics.overview.total_tickets) *
                            100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
