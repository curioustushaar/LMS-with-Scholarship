'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import {
  FiBarChart2,
  FiTrendingUp,
  FiAward,
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiPieChart,
} from 'react-icons/fi'

export default function SuperadminSchoolAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const getToken = async () => await getClientAuthToken()

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/schools/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error('Fetch analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBarChart2 className="text-[#C81E4E]" />
            School Tie-up Analytics & Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform performance metrics comparing Direct vs School Partner registration channels and financial yields
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading || !data ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading platform performance analytics...
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Registrations</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{data.summary.total_registrations || 0}</p>
              <span className="text-xs text-gray-400">All scholarship candidates</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">School Partner Share</p>
              <p className="text-3xl font-extrabold text-purple-700 mt-2">{data.summary.school_registrations || 0}</p>
              <span className="text-xs text-purple-500 font-medium">({data.summary.school_share_percentage} of total volume)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Direct Registrations</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-2">{data.summary.direct_registrations || 0}</p>
              <span className="text-xs text-blue-500 font-medium">From public web portal</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-pink-600 font-semibold uppercase tracking-wider">Incentive Distributed</p>
              <p className="text-3xl font-extrabold text-pink-700 mt-2">
                ₹{(data.summary.total_incentive_generated || 0).toLocaleString()}
              </p>
              <span className="text-xs text-pink-500 font-medium">Paid: ₹{(data.summary.total_payouts_completed || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Scholarship Financial & Registration Analytics */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-[#C81E4E]" />
              Scholarship-wise Breakdown & Net Revenue
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Scholarship Scheme</th>
                    <th className="px-4 py-3 text-center">Total Volume</th>
                    <th className="px-4 py-3 text-center">Direct vs School</th>
                    <th className="px-4 py-3 text-center">Partner Schools</th>
                    <th className="px-4 py-3">Gross Revenue</th>
                    <th className="px-4 py-3">School Incentive</th>
                    <th className="px-4 py-3">Net Before Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data.scholarship_analytics || []).map((sch: any) => (
                    <tr key={sch.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-900 text-sm">{sch.title}</p>
                        <p className="text-[11px] text-gray-400">Fee: ₹{sch.application_fee}/candidate</p>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-extrabold text-gray-900 text-sm">{sch.total_registrations}</span>
                        <p className="text-[10px] text-emerald-600 font-semibold">{sch.verified_registrations} verified</p>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="text-blue-600 font-bold">{sch.direct_registrations}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-purple-600 font-bold">{sch.school_registrations}</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold">
                          {sch.participating_schools} Schools
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        ₹{sch.gross_revenue.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-pink-600">
                        - ₹{sch.school_incentive_expense.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-emerald-700 text-sm">
                        ₹{sch.net_revenue_before_ops.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Participating Schools Leaderboard */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FiUsers className="text-purple-600" />
              School Partner Performance Leaderboard
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5">Rank</th>
                    <th className="px-4 py-2.5">School Partner</th>
                    <th className="px-4 py-2.5">Board / City</th>
                    <th className="px-4 py-2.5 text-center">Enrolled Students</th>
                    <th className="px-4 py-2.5 text-center">Qualified</th>
                    <th className="px-4 py-2.5">Incentive Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data.top_schools || []).map((s: any, idx: number) => (
                    <tr key={s.school_id}>
                      <td className="px-4 py-3 font-bold text-gray-500">#{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {s.school_id}
                        </span>
                        <p className="font-bold text-gray-900 mt-0.5">{s.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.board} | {s.city}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900 text-sm">
                        {s.enrolled_students}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                        {s.qualified_students}
                      </td>
                      <td className="px-4 py-3 font-bold text-pink-700">
                        ₹{s.incentive_earned.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
