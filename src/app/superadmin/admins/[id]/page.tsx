'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { superadminAPI } from '@/lib/api'
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiBookOpen,
  FiCheckSquare,
  FiFileText,
  FiMessageSquare,
  FiVideo,
  FiAward,
} from 'react-icons/fi'
import Link from 'next/link'

interface AdminDetail {
  profile: {
    id: string
    email: string
    full_name: string
    phone: string | null
    created_at: string
    account_status: string
  }
  summary: {
    total_courses_added: number
    total_students_added: number
    total_projects_evaluated: number
    total_tasks_created: number
    total_tickets_resolved: number
    total_videos_uploaded: number
    total_badges_awarded: number
    active_days: number
  }
  recent_activities: Array<{
    activity_date: string
    courses_added: number
    students_added: number
    projects_evaluated: number
    tasks_created: number
    tickets_resolved: number
    videos_uploaded: number
    badges_awarded: number
  }>
}

export default function AdminDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAdminDetail()
    }
  }, [params.id])

  const fetchAdminDetail = async () => {
    setLoading(true)
    const response = await superadminAPI.getAdminById(params.id as string)
    if (response.success) {
      setAdmin(response.data)
    } else {
      console.error('Failed to fetch admin:', response.error)
      alert('Failed to load admin details')
      router.push('/superadmin/admins')
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

  if (!admin) {
    return null
  }

  const activityStats = [
    {
      name: 'Projects Evaluated',
      value: admin.summary.total_projects_evaluated,
      icon: FiFileText,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Tickets Resolved',
      value: admin.summary.total_tickets_resolved,
      icon: FiMessageSquare,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Courses Added',
      value: admin.summary.total_courses_added,
      icon: FiBookOpen,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Tasks Created',
      value: admin.summary.total_tasks_created,
      icon: FiCheckSquare,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      name: 'Videos Uploaded',
      value: admin.summary.total_videos_uploaded,
      icon: FiVideo,
      color: 'from-[#C81E4E] to-[#D91E5B]',
    },
    {
      name: 'Badges Awarded',
      value: admin.summary.total_badges_awarded,
      icon: FiAward,
      color: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg shadow-lg p-6 text-white">
        <Link
          href="/superadmin/admins"
          className="inline-flex items-center space-x-2 text-white/90 hover:text-white mb-4"
        >
          <FiArrowLeft />
          <span>Back to Admins</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{admin.profile.full_name}</h1>
            <div className="flex items-center space-x-4 text-white/90">
              <span className="flex items-center space-x-2">
                <FiMail />
                <span>{admin.profile.email}</span>
              </span>
              {admin.profile.phone && (
                <span className="flex items-center space-x-2">
                  <FiPhone />
                  <span>{admin.profile.phone}</span>
                </span>
              )}
              <span className="flex items-center space-x-2">
                <FiCalendar />
                <span>Since {new Date(admin.profile.created_at).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
          <div className="text-center bg-white/20 rounded-lg px-6 py-4">
            <p className="text-sm text-white/80">Active Days</p>
            <p className="text-4xl font-bold">{admin.summary.active_days}</p>
          </div>
        </div>
      </div>

      {/* Activity Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activityStats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-transparent hover:border-[#C81E4E] transition-all"
            >
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
        })}
      </div>

      {/* Daily Activity History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FiActivity className="text-2xl text-[#C81E4E]" />
          <h2 className="text-xl font-bold text-gray-900">Daily Activity History (Last 30 Days)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Courses</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tasks</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Projects</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tickets</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Videos</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Badges</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admin.recent_activities.map((activity) => {
                const total = 
                  activity.courses_added + 
                  activity.tasks_created + 
                  activity.projects_evaluated + 
                  activity.tickets_resolved + 
                  activity.videos_uploaded + 
                  activity.badges_awarded

                return (
                  <tr key={activity.activity_date} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {new Date(activity.activity_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${activity.courses_added > 0 ? 'text-purple-700 font-semibold' : 'text-gray-400'}`}>
                        {activity.courses_added}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${activity.tasks_created > 0 ? 'text-yellow-700 font-semibold' : 'text-gray-400'}`}>
                        {activity.tasks_created}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${activity.projects_evaluated > 0 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                        {activity.projects_evaluated}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${activity.tickets_resolved > 0 ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                        {activity.tickets_resolved}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${activity.videos_uploaded > 0 ? 'text-red-700 font-semibold' : 'text-gray-400'}`}>
                        {activity.videos_uploaded}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${activity.badges_awarded > 0 ? 'text-orange-700 font-semibold' : 'text-gray-400'}`}>
                        {activity.badges_awarded}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {total}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {admin.recent_activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiTrendingUp className="text-5xl mx-auto mb-3 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
