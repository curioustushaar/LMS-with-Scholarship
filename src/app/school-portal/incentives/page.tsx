'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiDollarSign,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiDownload,
  FiArrowRight,
} from 'react-icons/fi'

export default function SchoolIncentivesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const getToken = async () => await getSchoolClientAuthToken()

  const fetchIncentives = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/incentives', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error('Fetch school incentives error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncentives()
  }, [])

  if (loading || !data) {
    return (
      <div className="p-16 text-center text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
        Calculating school incentive statement...
      </div>
    )
  }

  const { summary, schemes_breakdown = [], payout_history = [] } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiDollarSign className="text-emerald-600" />
            School Partner Incentive & Earnings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dynamic incentive statement calculated based on verified registrations across assigned scholarships
          </p>
        </div>
        <button
          onClick={fetchIncentives}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh Statement
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Incentive Earned</span>
          <p className="text-3xl font-extrabold text-gray-900">₹{(summary.total_earned || 0).toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-semibold">
            From {summary.total_verified_registrations || 0} verified student enrollments
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Disbursed / Paid Out</span>
          <p className="text-3xl font-extrabold text-emerald-700">₹{(summary.total_paid || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Credited to verified school bank account</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Balance</span>
          <p className="text-3xl font-extrabold text-amber-700">₹{(summary.pending_balance || 0).toLocaleString()}</p>
          <p className="text-xs text-amber-500">Processed periodically by Super Admin</p>
        </div>
      </div>

      {/* Scheme-wise Breakdown */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <FiAward className="text-[#FF2D8D]" />
          Scholarship-wise Incentive Earnings Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Scholarship Scheme</th>
                <th className="px-4 py-3 text-center">Total Enrolled</th>
                <th className="px-4 py-3 text-center">Verified Registrations</th>
                <th className="px-4 py-3">Incentive Rate</th>
                <th className="px-4 py-3">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schemes_breakdown.map((s: any) => (
                <tr key={s.scholarship_id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-900 text-sm">{s.scholarship_title}</p>
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-gray-700">{s.total_registered}</td>
                  <td className="px-4 py-3.5 text-center font-extrabold text-emerald-700 text-sm">{s.verified_count}</td>
                  <td className="px-4 py-3.5 font-bold text-purple-700">₹{s.incentive_rate}/verified student</td>
                  <td className="px-4 py-3.5 font-extrabold text-pink-700 text-base">₹{s.earned.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Disbursement / Payout History
          </h3>
          <Link
            href="/school-portal/profile"
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
          >
            Manage Payout Bank Details <FiArrowRight />
          </Link>
        </div>

        {payout_history.length === 0 ? (
          <p className="text-xs text-gray-400 p-6 text-center">No disbursement transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Disbursed Amount</th>
                  <th className="px-4 py-2.5">Transaction Ref</th>
                  <th className="px-4 py-2.5">Remarks</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payout_history.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-extrabold text-emerald-700 text-sm">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{p.payout_reference}</td>
                    <td className="px-4 py-3 text-gray-500">{p.notes}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                        PAID
                      </span>
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
