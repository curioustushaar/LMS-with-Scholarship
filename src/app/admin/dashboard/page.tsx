'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiUsers, FiUserCheck, FiFileText, FiCheckSquare, FiAlertCircle, FiAward, FiTrendingUp, FiClock, FiRefreshCw } from 'react-icons/fi'
import Link from 'next/link'
import { api } from '@/lib/api'

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  pendingSubmissions: number
  pendingProjects: number
  approvedProjects: number
  openTickets: number
  certificatesIssued: number
  avgCompletionRate: number
  weeklyActiveUsers: number
}

interface RecentStudent {
  id: string
  full_name: string
  email: string
  created_at: string
  account_status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data in parallel...')
      // Parallel execution: fetch overview and top 5 recent students simultaneously
      const [overviewData, studentsData] = await Promise.all([
        api.reports.getOverview(),
        api.students.getAll({ limit: 5 })
      ])

      if (overviewData?.success && overviewData.data) {
        // Map the nested API response to DashboardStats format
        const overview = overviewData.data
        const stats: DashboardStats = {
          totalStudents: overview.students?.total || 0,
          activeStudents: overview.students?.active || 0,
          pendingSubmissions: overview.tasks?.pending_evaluations || 0,
          pendingProjects: overview.projects?.pending_review || 0,
          approvedProjects: overview.projects?.approved || 0,
          openTickets: overview.tickets?.open || 0,
          certificatesIssued: overview.certificates?.total || 0,
          avgCompletionRate: 0,
          weeklyActiveUsers: overview.students?.total || 0
        }
        setStats(stats)
      }

      if (studentsData?.success && Array.isArray(studentsData.data)) {
        setRecentStudents(studentsData.data.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const summaryCards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: FiUsers, color: 'from-blue-500 to-blue-600', href: '/admin/students' },
    { title: 'Active Students', value: stats?.activeStudents || 0, icon: FiUserCheck, color: 'from-green-500 to-green-600', href: '/admin/students' },
    { title: 'Pending Evaluations', value: stats?.pendingSubmissions || 0, icon: FiCheckSquare, color: 'from-orange-500 to-orange-600', href: '/admin/tasks' },
    { title: 'Pending Projects', value: stats?.pendingProjects || 0, icon: FiFileText, color: 'from-purple-500 to-purple-600', href: '/admin/projects' },
    { title: 'Open Tickets', value: stats?.openTickets || 0, icon: FiAlertCircle, color: 'from-red-500 to-red-600', href: '/admin/support' },
    { title: 'Certificates Issued', value: stats?.certificatesIssued || 0, icon: FiAward, color: 'from-yellow-500 to-yellow-600', href: '/admin/certificates' },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back! Here's what's happening with your LMS today.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-[#C81E4E] text-white rounded-lg hover:bg-[#D91E5B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value.toLocaleString()}</p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-full flex items-center justify-center`}>
                  <card.icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <Link href={card.href} className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium flex items-center">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Link href="/admin/tasks/submissions" className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiCheckSquare className="text-2xl md:text-3xl mb-2 md:mb-3" />
          <p className="font-semibold text-sm md:text-base">Evaluate Tasks</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">{stats?.pendingSubmissions || 0} pending</p>
        </Link>
        <Link href="/admin/projects" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiFileText className="text-2xl md:text-3xl mb-2 md:mb-3" />
          <p className="font-semibold text-sm md:text-base">Approve Projects</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">{stats?.approvedProjects || 0} approved</p>
        </Link>
        <Link href="/admin/support" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiAlertCircle className="text-2xl md:text-3xl mb-2 md:mb-3" />
          <p className="font-semibold text-sm md:text-base">View Tickets</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">{stats?.openTickets || 0} open</p>
        </Link>
        <Link href="/admin/certificates" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiAward className="text-2xl md:text-3xl mb-2 md:mb-3" />
          <p className="font-semibold text-sm md:text-base">Issue Certificates</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">View eligible</p>
        </Link>
      </div>

      {/* Recent Students */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Recent Student Signups</h2>
          <Link href="/admin/students" className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium">
            View All →
          </Link>
        </div>
        <div className="p-6">
          {recentStudents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent students</p>
          ) : (
            <div className="space-y-4">
              {recentStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{student.full_name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${student.account_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {student.account_status}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{new Date(student.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
