'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import {
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiAward,
  FiFileText,
  FiCheck,
} from 'react-icons/fi'

export default function SuperadminIncentivesPage() {
  const [schools, setSchools] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<any>(null)
  const [payoutFormData, setPayoutFormData] = useState({
    amount: '',
    payout_reference: '',
    notes: '',
  })

  const getToken = async () => await getClientAuthToken()

  const fetchIncentives = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/schools/incentives', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSchools(data.schools || [])
        setPayouts(data.payout_history || [])
        setSummary(data.summary || {})
      }
    } catch (err) {
      console.error('Fetch incentives error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncentives()
  }, [])

  const handleOpenPayout = (school: any) => {
    setSelectedSchool(school)
    setPayoutFormData({
      amount: school.pending_amount > 0 ? String(school.pending_amount) : '1000',
      payout_reference: `DISB-TXN-${Date.now().toString().slice(-6)}`,
      notes: `Incentive disbursement for ${school.school_name}`,
    })
    setShowPayoutModal(true)
  }

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/schools/incentives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          school_id: selectedSchool.school_id,
          amount: Number(payoutFormData.amount),
          payout_reference: payoutFormData.payout_reference,
          notes: payoutFormData.notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowPayoutModal(false)
        fetchIncentives()
      } else {
        alert(data.error || 'Failed to record payout')
      }
    } catch (err: any) {
      alert(err.message || 'Error recording payout')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiDollarSign className="text-emerald-600" />
            School Partner Incentives & Payouts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dynamic incentive statements calculated per verified student registration (₹ rate × verified count)
          </p>
        </div>
        <button
          onClick={fetchIncentives}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Incentive Generated</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">
            ₹{(summary.total_incentive_generated || 0).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-1">From confirmed verified applications</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Total Paid Out</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
            ₹{(summary.total_incentive_paid || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">Disbursed to partner bank accounts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Pending Payout Balance</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">
            ₹{(summary.total_incentive_pending || 0).toLocaleString()}
          </p>
          <p className="text-xs text-amber-500 mt-1">Eligible for processing</p>
        </div>
      </div>

      {/* School Incentive Summary Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-5">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          School-wise Incentive Accounts
        </h3>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Calculating incentive statements...</div>
        ) : schools.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No partner school incentive records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">School Partner</th>
                  <th className="px-4 py-3 text-center">Verified Students</th>
                  <th className="px-4 py-3">Total Earned</th>
                  <th className="px-4 py-3">Disbursed</th>
                  <th className="px-4 py-3">Pending Balance</th>
                  <th className="px-4 py-3">Bank Details</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schools.map((s) => (
                  <tr key={s.school_id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {s.school_id}
                      </span>
                      <p className="font-bold text-gray-900 text-sm mt-1">{s.school_name}</p>
                      <p className="text-[11px] text-gray-400">{s.city} | {s.official_email}</p>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-extrabold text-emerald-700 text-sm">{s.total_verified}</span>
                      <span className="text-gray-400 text-[10px] block">/ {s.total_registered} total</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-gray-900 text-sm">₹{s.total_earned.toLocaleString()}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-700">₹{s.total_paid.toLocaleString()}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`font-bold ${s.pending_amount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                        ₹{s.pending_amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {s.bank_details?.account_number ? (
                        <div className="text-[10px] text-gray-600">
                          <p className="font-bold text-gray-800">{s.bank_details.bank_name}</p>
                          <p>A/C: ••••{s.bank_details.account_number.slice(-4)}</p>
                          <p>IFSC: {s.bank_details.ifsc_code}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Not submitted</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenPayout(s)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all inline-flex items-center gap-1"
                      >
                        <FiDollarSign size={12} />
                        Disburse Payout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout History Log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Recent Payout Transactions History
        </h3>
        {payouts.length === 0 ? (
          <p className="text-xs text-gray-400 p-4 text-center">No disbursements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">School ID</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Transaction Ref</th>
                  <th className="px-4 py-2.5">Notes</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 text-gray-500">{new Date(p.paid_at || p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-purple-700">{p.school_id}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-700 text-sm">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-600">{p.payout_reference}</td>
                    <td className="px-4 py-2.5 text-gray-500">{p.notes}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payout Modal */}
      {showPayoutModal && selectedSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Record Incentive Disbursement</h3>
            <p className="text-xs text-gray-500">
              Disbursing payout to <b>{selectedSchool.school_name}</b> ({selectedSchool.school_id}).
            </p>

            <form onSubmit={handleRecordPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payout Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={payoutFormData.amount}
                  onChange={(e) => setPayoutFormData({ ...payoutFormData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Transaction / Bank Ref *
                </label>
                <input
                  type="text"
                  required
                  value={payoutFormData.payout_reference}
                  onChange={(e) => setPayoutFormData({ ...payoutFormData, payout_reference: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Notes / Payout Remarks
                </label>
                <textarea
                  rows={2}
                  value={payoutFormData.notes}
                  onChange={(e) => setPayoutFormData({ ...payoutFormData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
