'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { supabase } from '@/lib/supabase'
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFilter,
  FiCreditCard,
  FiCopy,
  FiCheck,
  FiExternalLink,
  FiEye,
  FiX,
  FiPieChart,
  FiBarChart2,
  FiSend,
  FiPercent,
  FiAward,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCalendar,
  FiPrinter,
  FiActivity,
  FiShield,
  FiLayers,
} from 'react-icons/fi'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface TransactionItem {
  id: string
  application_no: string
  registration_code: string
  scholarship_id: string
  scholarship_title: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  qualification: string
  location: string
  school_id: string | null
  school_name: string
  registration_source: string
  reference_code: string | null
  status: string
  payment_status: string
  payment_reference: string
  original_fee: number
  discount_percent: number
  discount_amount: number
  payment_amount: number
  created_at: string
  is_paid: boolean
  is_free: boolean
}

interface SchoolFinancial {
  school_id: string
  school_name: string
  official_email: string
  mobile: string
  city: string
  state: string
  bank_details?: any
  total_students_referred: number
  verified_paid_students: number
  total_incentive_earned: number
  total_payout_disbursed: number
  pending_incentive_liability: number
  schemes_breakdown: Array<{
    scholarship_id: string
    scholarship_title: string
    rate: number
    total_registered: number
    verified_count: number
    earned: number
  }>
}

interface SchemeBreakdown {
  id: string
  title: string
  category: string
  application_fee: number
  scholarship_value: string
  total_applicants: number
  paid_count: number
  free_count: number
  pending_count: number
  total_revenue: number
  avg_revenue_per_applicant: number
}

interface ReferralBreakdown {
  id: string
  code: string
  partner_name: string
  partner_phone: string
  partner_email: string
  discount_percent: number
  status: string
  total_usage_count: number
  paid_usage_count: number
  revenue_generated: number
  discounts_granted: number
}

interface PaymentSummary {
  total_gross_revenue: number
  net_platform_revenue: number
  total_paid_count: number
  total_free_count: number
  total_pending_count: number
  total_failed_count: number
  total_applications_count: number
  total_discount_granted: number
  today_gross_revenue: number
  today_transactions_count: number
  month_gross_revenue: number
  total_partner_incentives_earned: number
  total_partner_payouts_disbursed: number
  total_partner_incentives_pending: number
  active_partner_schools_count: number
  active_schemes_count: number
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#6366F1']

export default function SuperadminPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // API Data
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [schoolFinancials, setSchoolFinancials] = useState<SchoolFinancial[]>([])
  const [schemeBreakdown, setSchemeBreakdown] = useState<SchemeBreakdown[]>([])
  const [referralBreakdown, setReferralBreakdown] = useState<ReferralBreakdown[]>([])
  const [payoutHistory, setPayoutHistory] = useState<any[]>([])
  const [dailyTrends, setDailyTrends] = useState<any[]>([])

  // Active Tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'schemes' | 'schools' | 'referrals' | 'payouts'>('transactions')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'paid' | 'free' | 'pending' | 'failed'>('ALL')
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DIRECT' | 'SCHOOL'>('ALL')
  const [schemeFilter, setSchemeFilter] = useState<string>('ALL')
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modals
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutSchool, setPayoutSchool] = useState<SchoolFinancial | null>(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutRef, setPayoutRef] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [payoutLoading, setPayoutLoading] = useState(false)

  // Pagination for Transactions
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch Dashboard Data
  const fetchPaymentData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true)
    try {
      const token = await getClientAuthToken()
      const res = await fetch('/api/superadmin/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })
      const json = await res.json()

      if (json.success) {
        setSummary(json.summary)
        setTransactions(json.transactions || [])
        setSchoolFinancials(json.school_financials || [])
        setSchemeBreakdown(json.scheme_breakdown || [])
        setReferralBreakdown(json.referral_breakdown || [])
        setPayoutHistory(json.payout_history || [])
        setDailyTrends(json.daily_trends || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch payment analytics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentData()

    // Setup Supabase Realtime Subscription for instantaneous database updates
    const channel = supabase
      .channel('realtime_payments_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scholarship_applications' },
        (payload) => {
          console.log('⚡ Realtime scholarship application payment update received:', payload)
          fetchPaymentData(true)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'school_incentive_payouts' },
        (payload) => {
          console.log('⚡ Realtime payout update received:', payload)
          fetchPaymentData(true)
        }
      )
      .subscribe()

    // Optional background auto-poll every 20 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchPaymentData(true)
      }
    }, 20000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchPaymentData, autoRefresh])

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = tx.applicant_name?.toLowerCase().includes(q)
        const matchEmail = tx.applicant_email?.toLowerCase().includes(q)
        const matchPhone = tx.applicant_phone?.toLowerCase().includes(q)
        const matchAppNo = tx.application_no?.toLowerCase().includes(q)
        const matchRegCode = tx.registration_code?.toLowerCase().includes(q)
        const matchPayRef = tx.payment_reference?.toLowerCase().includes(q)
        const matchSchool = tx.school_name?.toLowerCase().includes(q)
        const matchRefCode = tx.reference_code?.toLowerCase().includes(q)
        const matchScheme = tx.scholarship_title?.toLowerCase().includes(q)

        if (!matchName && !matchEmail && !matchPhone && !matchAppNo && !matchRegCode && !matchPayRef && !matchSchool && !matchRefCode && !matchScheme) {
          return false
        }
      }

      // Status
      if (statusFilter !== 'ALL' && tx.payment_status !== statusFilter) {
        return false
      }

      // Source
      if (sourceFilter !== 'ALL' && tx.registration_source !== sourceFilter) {
        return false
      }

      // Scheme
      if (schemeFilter !== 'ALL' && tx.scholarship_id !== schemeFilter) {
        return false
      }

      // Date Range
      if (dateRangeFilter === 'TODAY') {
        if (!tx.created_at?.startsWith(todayStr)) return false
      } else if (dateRangeFilter === '7DAYS') {
        if (new Date(tx.created_at) < sevenDaysAgo) return false
      } else if (dateRangeFilter === '30DAYS') {
        if (new Date(tx.created_at) < thirtyDaysAgo) return false
      }

      return true
    })
  }, [transactions, searchQuery, statusFilter, sourceFilter, schemeFilter, dateRangeFilter])

  // Paginated Transactions
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.')
      return
    }

    const headers = [
      'Application No',
      'Registration Code',
      'Applicant Name',
      'Applicant Email',
      'Applicant Phone',
      'Scholarship Title',
      'Registration Source',
      'Partner School',
      'Referral Code',
      'Original Fee',
      'Discount Applied',
      'Amount Paid (INR)',
      'Payment Status',
      'Payment Reference / Razorpay ID',
      'Date & Time',
    ]

    const rows = filteredTransactions.map((tx) => [
      `"${tx.application_no || ''}"`,
      `"${tx.registration_code || ''}"`,
      `"${(tx.applicant_name || '').replace(/"/g, '""')}"`,
      `"${tx.applicant_email || ''}"`,
      `"${tx.applicant_phone || ''}"`,
      `"${(tx.scholarship_title || '').replace(/"/g, '""')}"`,
      `"${tx.registration_source || ''}"`,
      `"${(tx.school_name || '').replace(/"/g, '""')}"`,
      `"${tx.reference_code || ''}"`,
      tx.original_fee || 0,
      tx.discount_amount || 0,
      tx.payment_amount || 0,
      `"${tx.payment_status || ''}"`,
      `"${tx.payment_reference || ''}"`,
      `"${new Date(tx.created_at).toLocaleString('en-IN')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Scholarship_Payment_Transactions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Open Payout Modal
  const handleOpenPayout = (school: SchoolFinancial) => {
    setPayoutSchool(school)
    setPayoutAmount(school.pending_incentive_liability > 0 ? String(school.pending_incentive_liability) : '1000')
    setPayoutRef(`DISB-SCH-TXN-${Date.now().toString().slice(-6)}`)
    setPayoutNotes(`Partner referral incentive payment to ${school.school_name}`)
    setShowPayoutModal(true)
  }

  // Submit Payout
  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payoutSchool) return
    const numAmt = Number(payoutAmount)
    if (isNaN(numAmt) || numAmt <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setPayoutLoading(true)
    try {
      const token = await getClientAuthToken()
      const res = await fetch('/api/superadmin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'school_payout',
          school_id: payoutSchool.school_id,
          amount: numAmt,
          payout_reference: payoutRef,
          notes: payoutNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowPayoutModal(false)
        fetchPaymentData(true)
      } else {
        alert(data.error || 'Failed to record payout')
      }
    } catch (err: any) {
      alert(err.message || 'Error processing payout')
    } finally {
      setPayoutLoading(false)
    }
  }

  // Quick summary pie data
  const pieData = useMemo(() => {
    if (!summary) return []
    return [
      { name: 'Paid Intake', value: summary.total_paid_count, color: '#10B981' },
      { name: 'Free / 100% Waiver', value: summary.total_free_count, color: '#3B82F6' },
      { name: 'Pending / Verification', value: summary.total_pending_count, color: '#F59E0B' },
    ].filter((d) => d.value > 0)
  }, [summary])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-[#C81E4E] rounded-full animate-spin"></div>
          <FiDollarSign className="absolute inset-0 m-auto text-xl text-[#C81E4E]" />
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-700">Connecting to Realtime Payment Gateway & Database...</p>
        <p className="text-xs text-gray-400 mt-1">Aggregating live transactions, school commissions, and revenue analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Top Header & Real-time Live Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 p-6 rounded-2xl text-white shadow-xl border border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#C81E4E] to-[#E11D48] rounded-xl shadow-lg shadow-rose-900/30">
              <FiDollarSign className="text-2xl text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Payment & Revenue Analytics</h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time tracking of Scholarship Form fees, School Partner commissions, and Financial settlements
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300">
            <span className="text-gray-400">Last Synced:</span>
            <span className="font-mono text-emerald-400 font-semibold">{lastUpdated.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
            Auto-Sync: {autoRefresh ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => fetchPaymentData(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] hover:from-[#B01A44] hover:to-[#C81E4E] text-white text-xs font-bold rounded-lg shadow-md hover:shadow-rose-600/30 transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Instant Refresh'}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-bold rounded-lg border border-gray-700 transition-all shadow-sm"
          >
            <FiDownload className="text-sm text-rose-400" />
            Export CSV Ledger
          </button>
        </div>
      </div>

      {/* ── Executive KPI Summary Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Gross Collections</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <FiDollarSign className="text-xl" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              ₹{(summary?.total_gross_revenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <FiArrowUpRight className="text-sm" />
                Today: ₹{(summary?.today_gross_revenue || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-600 font-medium">
                This Month: ₹{(summary?.month_gross_revenue || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </div>

        {/* Net Platform Revenue */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Net Platform Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <FiTrendingUp className="text-xl" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              ₹{(summary?.net_platform_revenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600 font-medium">
              <span>Gross minus School Payouts</span>
              <span className="text-indigo-600 font-semibold">Margin ~95%</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
        </div>

        {/* Paid vs Free Registrations */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Intake Breakdown</span>
            <div className="p-2 rounded-xl bg-rose-50 text-[#C81E4E] group-hover:scale-110 transition-transform">
              <FiUsers className="text-xl" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {(summary?.total_applications_count || 0).toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-gray-600">Total Applicants</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {summary?.total_paid_count || 0} Paid
              </span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {summary?.total_free_count || 0} Free / 100%
              </span>
              {summary?.total_pending_count ? (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {summary.total_pending_count} Pending
                </span>
              ) : null}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C81E4E] to-rose-400"></div>
        </div>

        {/* School Partner Liabilities */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">School Commissions</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <FiAward className="text-xl" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              ₹{(summary?.total_partner_incentives_earned || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">
                Disbursed: ₹{(summary?.total_partner_payouts_disbursed || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending: ₹{(summary?.total_partner_incentives_pending || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
        </div>
      </div>

      {/* ── Visual Analytics Section (Charts) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Revenue & Transactions Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FiActivity className="text-[#C81E4E]" />
                14-Day Collections & Application Velocity
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">Daily collection curve and incoming scholarship volume</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-[#C81E4E] border border-rose-200">
              Live Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C81E4E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C81E4E" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="display_date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#10B981' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : `${value} applicants`,
                    name === 'revenue' ? 'Revenue Collected' : name === 'paid_count' ? 'Paid Applicants' : 'Free Tier',
                  ]}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#C81E4E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="revenue" />
                <Area yAxisId="right" type="monotone" dataKey="paid_count" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" name="paid_count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment & Channel Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiPieChart className="text-indigo-600" />
                  Intake Distribution
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">Paid vs Free vs School Partners</p>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-600 font-medium">Direct Paid Registrations</span>
              </div>
              <span className="font-bold text-gray-900">{summary?.total_paid_count || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-600 font-medium">Free Tier / 100% Promo</span>
              </div>
              <span className="font-bold text-gray-900">{summary?.total_free_count || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-gray-600 font-medium">Partner Schools Enrolled</span>
              </div>
              <span className="font-bold text-gray-900">{summary?.active_partner_schools_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center border-b border-gray-200 bg-gray-50/70 px-4 pt-3 gap-1">
          <button
            onClick={() => { setActiveTab('transactions'); setCurrentPage(1) }}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'transactions'
                ? 'bg-white text-[#C81E4E] border-[#C81E4E] shadow-sm font-extrabold'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100/60'
            }`}
          >
            <FiCreditCard className="text-base" />
            Live Transactions Ledger
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'transactions' ? 'bg-rose-100 text-[#C81E4E]' : 'bg-gray-200 text-gray-700'
            }`}>
              {filteredTransactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'schemes'
                ? 'bg-white text-[#C81E4E] border-[#C81E4E] shadow-sm font-extrabold'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100/60'
            }`}
          >
            <FiAward className="text-base" />
            Scholarship Schemes Matrix
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-200 text-gray-700">
              {schemeBreakdown.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schools')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'schools'
                ? 'bg-white text-[#C81E4E] border-[#C81E4E] shadow-sm font-extrabold'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100/60'
            }`}
          >
            <FiUsers className="text-base" />
            School Partners & Commissions
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-200 text-gray-700">
              {schoolFinancials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'referrals'
                ? 'bg-white text-[#C81E4E] border-[#C81E4E] shadow-sm font-extrabold'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100/60'
            }`}
          >
            <FiPercent className="text-base" />
            Referral Codes & Discounts
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-200 text-gray-700">
              {referralBreakdown.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'payouts'
                ? 'bg-white text-[#C81E4E] border-[#C81E4E] shadow-sm font-extrabold'
                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100/60'
            }`}
          >
            <FiSend className="text-base" />
            Payout Disbursements Log
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-200 text-gray-700">
              {payoutHistory.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: Live Transactions Ledger ── */}
        {activeTab === 'transactions' && (
          <div className="p-6 space-y-4">
            {/* Search & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
              <div className="relative flex-1 min-w-[280px]">
                <FiSearch className="absolute left-3.5 top-3 text-gray-400 text-base" />
                <input
                  type="text"
                  placeholder="Search by Name, Email, Phone, App No, Ref Code, Razorpay ID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1) }}
                  className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#C81E4E] shadow-sm font-medium"
                >
                  <option value="ALL">All Payment Status</option>
                  <option value="paid">Paid Only</option>
                  <option value="free">Free / Discounted Tier</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => { setSourceFilter(e.target.value as any); setCurrentPage(1) }}
                  className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#C81E4E] shadow-sm font-medium"
                >
                  <option value="ALL">All Channels</option>
                  <option value="DIRECT">Direct Student</option>
                  <option value="SCHOOL">School Partner</option>
                </select>

                {/* Scheme Filter */}
                <select
                  value={schemeFilter}
                  onChange={(e) => { setSchemeFilter(e.target.value); setCurrentPage(1) }}
                  className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#C81E4E] shadow-sm font-medium max-w-[180px] truncate"
                >
                  <option value="ALL">All Schemes</option>
                  {schemeBreakdown.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                {/* Date Filter */}
                <select
                  value={dateRangeFilter}
                  onChange={(e) => { setDateRangeFilter(e.target.value as any); setCurrentPage(1) }}
                  className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#C81E4E] shadow-sm font-medium"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today Only</option>
                  <option value="7DAYS">Last 7 Days</option>
                  <option value="30DAYS">Last 30 Days</option>
                </select>

                {(searchQuery || statusFilter !== 'ALL' || sourceFilter !== 'ALL' || schemeFilter !== 'ALL' || dateRangeFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('ALL')
                      setSourceFilter('ALL')
                      setSchemeFilter('ALL')
                      setDateRangeFilter('ALL')
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 text-[11px] font-black text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-4">Applicant & Identifiers</th>
                    <th className="py-3.5 px-4">Scholarship Scheme</th>
                    <th className="py-3.5 px-4">Channel / Source</th>
                    <th className="py-3.5 px-4">Referral & Discount</th>
                    <th className="py-3.5 px-4">Amount Paid</th>
                    <th className="py-3.5 px-4">Payment Reference</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 text-xs font-medium text-gray-700 bg-white">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <FiAlertCircle className="mx-auto text-3xl mb-2 text-gray-300" />
                        <p className="font-semibold text-gray-600">No payment transactions match the selected filters.</p>
                        <p className="text-xs text-gray-400 mt-0.5">Try resetting search query or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-rose-50/30 transition-colors">
                        {/* Applicant */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{tx.applicant_name}</div>
                          <div className="text-[11px] text-gray-500">{tx.applicant_email}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{tx.applicant_phone}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
                              {tx.application_no}
                            </span>
                            <span className="font-mono text-[10px] bg-rose-50 text-[#C81E4E] px-1.5 py-0.5 rounded font-bold">
                              {tx.registration_code}
                            </span>
                          </div>
                        </td>

                        {/* Scheme */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block max-w-[200px] truncate" title={tx.scholarship_title}>
                            {tx.scholarship_title}
                          </span>
                          <span className="text-[11px] text-gray-500">{tx.qualification}</span>
                        </td>

                        {/* Source / School */}
                        <td className="py-3 px-4">
                          {tx.registration_source === 'SCHOOL' || tx.school_id ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                🏫 Partner School
                              </span>
                              <div className="text-[11px] text-gray-600 font-semibold mt-0.5 max-w-[160px] truncate" title={tx.school_name}>
                                {tx.school_name}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Direct Portal
                            </span>
                          )}
                        </td>

                        {/* Referral & Discount */}
                        <td className="py-3 px-4">
                          {tx.reference_code ? (
                            <div>
                              <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {tx.reference_code}
                              </span>
                              {tx.discount_percent > 0 && (
                                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                  {tx.discount_percent}% Off (Saved ₹{tx.discount_amount})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Standard Tier</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4">
                          <div className="font-black text-sm text-gray-900">
                            ₹{tx.payment_amount.toLocaleString('en-IN')}
                          </div>
                          {tx.discount_amount > 0 && (
                            <div className="text-[10px] text-gray-400 line-through">
                              ₹{tx.original_fee}
                            </div>
                          )}
                          <div className="mt-1">
                            {tx.payment_status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <FiCheckCircle className="text-[10px]" /> Paid
                              </span>
                            ) : tx.payment_status === 'free' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                Free 100%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                {tx.payment_status}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Payment Ref */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200 max-w-[140px] truncate" title={tx.payment_reference}>
                              {tx.payment_reference}
                            </span>
                            <button
                              onClick={() => handleCopy(tx.payment_reference, tx.id)}
                              className="p-1 hover:bg-gray-100 text-gray-500 rounded transition-colors"
                              title="Copy Reference"
                            >
                              {copiedId === tx.id ? <FiCheck className="text-emerald-600 text-xs" /> : <FiCopy className="text-xs" />}
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-gray-800">
                            {new Date(tx.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(tx.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-[#C81E4E] hover:text-white text-gray-700 text-xs font-bold rounded-lg transition-all shadow-sm"
                          >
                            <FiEye className="text-xs" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs text-gray-600">
                <div>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 font-semibold"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 font-bold text-gray-900">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Scholarship Schemes Matrix ── */}
        {activeTab === 'schemes' && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Scholarship Scheme Financial Performance</h2>
              <p className="text-xs text-gray-600 mt-0.5">Program-level revenue aggregation, intake statistics, and ticket sizes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schemeBreakdown.map((sch) => (
                <div key={sch.id} className="bg-gradient-to-br from-white to-gray-50/60 p-5 rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-[#C81E4E] border border-rose-200">
                        {sch.category || 'Merit Scheme'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mt-2 line-clamp-1" title={sch.title}>
                        {sch.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-semibold">Fee</div>
                      <div className="text-sm font-black text-gray-900">₹{sch.application_fee}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">Total Collected</div>
                      <div className="text-xl font-black text-emerald-600">
                        ₹{sch.total_revenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium">Total Intake</div>
                      <div className="text-xl font-black text-gray-900">
                        {sch.total_applicants}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                    <span>Paid: <strong className="text-emerald-600">{sch.paid_count}</strong></span>
                    <span>Free: <strong className="text-blue-600">{sch.free_count}</strong></span>
                    <span>Avg/Applicant: <strong className="text-gray-900">₹{sch.avg_revenue_per_applicant}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: School Partners & Commissions ── */}
        {activeTab === 'schools' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">School & Coaching Partner Incentive Statements</h2>
                <p className="text-xs text-gray-600 mt-0.5">Track registrations per institution, accrued commission, and process settlement disbursements</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 text-[11px] font-black text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-4">Partner Institution</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Referred / Verified</th>
                    <th className="py-3.5 px-4">Total Earned</th>
                    <th className="py-3.5 px-4">Total Paid Out</th>
                    <th className="py-3.5 px-4">Pending Balance</th>
                    <th className="py-3.5 px-4 text-center">Settlement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 text-xs font-medium text-gray-700 bg-white">
                  {schoolFinancials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No school partner records available.
                      </td>
                    </tr>
                  ) : (
                    schoolFinancials.map((sch) => (
                      <tr key={sch.school_id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{sch.school_name}</div>
                          <span className="font-mono text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
                            {sch.school_id}
                          </span>
                          <div className="text-[11px] text-gray-500 mt-0.5">{sch.city}, {sch.state}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-gray-900">{sch.official_email}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{sch.mobile}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{sch.total_students_referred} Total</div>
                          <div className="text-emerald-700 text-[11px] font-semibold">
                            {sch.verified_paid_students} Verified
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-black text-sm text-gray-900">
                          ₹{sch.total_incentive_earned.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          ₹{sch.total_payout_disbursed.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                            sch.pending_incentive_liability > 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            ₹{sch.pending_incentive_liability.toLocaleString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenPayout(sch)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
                          >
                            <FiSend className="text-xs" /> Disburse Payout
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: Referral Codes & Discounts ── */}
        {activeTab === 'referrals' && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Promotional & Referral Code Financial Breakdown</h2>
              <p className="text-xs text-gray-600 mt-0.5">Performance metrics for reference codes, discount subsidies, and gross revenue generated</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 text-[11px] font-black text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-4">Referral Code</th>
                    <th className="py-3.5 px-4">Partner / Owner</th>
                    <th className="py-3.5 px-4">Discount Rate</th>
                    <th className="py-3.5 px-4">Total Uses</th>
                    <th className="py-3.5 px-4">Gross Revenue Captured</th>
                    <th className="py-3.5 px-4">Total Discounts Granted</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 text-xs font-medium text-gray-700 bg-white">
                  {referralBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No referral codes recorded.
                      </td>
                    </tr>
                  ) : (
                    referralBreakdown.map((rc) => (
                      <tr key={rc.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-sm text-[#C81E4E] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            {rc.code}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{rc.partner_name || 'Generic Promo'}</div>
                          <div className="text-[11px] text-gray-500">{rc.partner_phone}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {rc.discount_percent}% Discount
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {rc.total_usage_count} uses ({rc.paid_usage_count} paid)
                        </td>

                        <td className="py-3.5 px-4 font-black text-sm text-emerald-700">
                          ₹{rc.revenue_generated.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-rose-600">
                          ₹{rc.discounts_granted.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            rc.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rc.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 5: Payouts History Log ── */}
        {activeTab === 'payouts' && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Historical Incentive Disbursements Log</h2>
              <p className="text-xs text-gray-600 mt-0.5">Audit trail of all commission settlements disbursed to partner schools</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/80 text-[11px] font-black text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-4">Disbursement Ref</th>
                    <th className="py-3.5 px-4">Partner School ID</th>
                    <th className="py-3.5 px-4">Amount Disbursed</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Notes / Purpose</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 text-xs font-medium text-gray-700 bg-white">
                  {payoutHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        No payout disbursements recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payoutHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-gray-900">
                          {p.payout_reference || p.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-purple-700">
                          {p.school_id}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          ₹{(Number(p.amount) || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {p.status || 'PAID'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-[240px] truncate" title={p.notes}>
                          {p.notes || 'Incentive disbursement'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(p.paid_at || p.created_at).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Transaction Receipt View ── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                  Official Payment Receipt
                </span>
                <h3 className="text-xl font-black mt-1 text-white">{selectedTx.scholarship_title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Registration Ref: {selectedTx.registration_code}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Payment Summary Box */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Amount Collected</span>
                  <div className="text-3xl font-black text-emerald-900 mt-0.5">
                    ₹{selectedTx.payment_amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5 flex items-center gap-1 font-semibold">
                    <FiCheckCircle /> Status: {selectedTx.payment_status.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-medium">Gateway Payment ID</span>
                  <div className="font-mono text-xs font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-emerald-200 mt-1">
                    {selectedTx.payment_reference}
                  </div>
                </div>
              </div>

              {/* Applicant Profile Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Applicant Name</span>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedTx.applicant_name}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Application Number</span>
                  <div className="font-mono font-bold text-gray-900 text-sm mt-0.5">{selectedTx.application_no}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Contact Email</span>
                  <div className="font-semibold text-gray-900 mt-0.5">{selectedTx.applicant_email}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Contact Mobile</span>
                  <div className="font-mono font-semibold text-gray-900 mt-0.5">{selectedTx.applicant_phone}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Registration Channel</span>
                  <div className="font-bold text-purple-700 mt-0.5">
                    {selectedTx.registration_source === 'SCHOOL' ? `Partner School (${selectedTx.school_name})` : 'Direct Candidate'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Promo / Referral Code</span>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    {selectedTx.reference_code ? `${selectedTx.reference_code} (${selectedTx.discount_percent}% Off)` : 'None'}
                  </div>
                </div>
              </div>

              {/* Timestamp and Verification */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Recorded On: <strong>{new Date(selectedTx.created_at).toLocaleString('en-IN')}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <FiShield /> Verified Secure Database Record
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-all"
              >
                <FiPrinter /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Disburse Partner Payout ── */}
      {showPayoutModal && payoutSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700">
                  Partner Settlement
                </span>
                <h3 className="text-lg font-black mt-1 text-white">Disburse School Incentive</h3>
                <p className="text-xs text-emerald-200 mt-0.5">{payoutSchool.school_name}</p>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-2 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-900/50 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayout} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex justify-between items-center">
                <span className="text-amber-800 font-medium">Pending Incentive Balance:</span>
                <span className="font-black text-amber-900 text-sm">
                  ₹{payoutSchool.pending_incentive_liability.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Disbursement Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 5000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Reference / UTR / Txn ID *</label>
                <input
                  type="text"
                  required
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. UTR12345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Disbursement Notes</label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Bank Transfer processed for verified registrations"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {payoutLoading ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
