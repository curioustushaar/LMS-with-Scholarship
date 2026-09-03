'use client'

import { useState } from 'react'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiFileText,
  FiDownload,
  FiUsers,
  FiCheckSquare,
  FiDollarSign,
  FiCheck,
} from 'react-icons/fi'

export default function SchoolReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const getToken = async () => await getSchoolClientAuthToken()

  const handleDownloadReport = async (type: 'registrations' | 'results' | 'incentives') => {
    setDownloading(type)
    try {
      const token = await getToken()
      const res = await fetch(`/api/school/reports?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()

      if (json.success && json.data && json.data.length > 0) {
        const headers = Object.keys(json.data[0])
        const rows = json.data.map((row: any) =>
          headers.map((h) => `"${(row[h] !== null && row[h] !== undefined ? String(row[h]) : '').replace(/"/g, '""')}"`)
        )

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `School_${type}_report_${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('No data records available to download for this report.')
      }
    } catch (err: any) {
      alert(err.message || 'Error generating report download')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiFileText className="text-[#FF2D8D]" />
          School Partner Report Export Center
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Export standardized CSV data reports for student enrollments, exam scorecards, and financial incentive statements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Registrations Report */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiUsers size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Student Enrollments Report</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Complete directory of all registered students with roll numbers, registration dates, class, section, payment verification status, and exam attendance.
            </p>
          </div>

          <button
            onClick={() => handleDownloadReport('registrations')}
            disabled={downloading === 'registrations'}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiDownload />
            {downloading === 'registrations' ? 'Generating CSV...' : 'Download Enrollments CSV'}
          </button>
        </div>

        {/* Card 2: Results Report */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiCheckSquare size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Exam Results & Scorecard Report</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Official scholarship examination scores, percentages, national and school merit ranks, qualification status, and prize awards for your students.
            </p>
          </div>

          <button
            onClick={() => handleDownloadReport('results')}
            disabled={downloading === 'results'}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiDownload />
            {downloading === 'results' ? 'Generating CSV...' : 'Download Results CSV'}
          </button>
        </div>

        {/* Card 3: Incentives Statement */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#FF2D8D] flex items-center justify-center">
              <FiDollarSign size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Incentives & Payout Statement</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Financial statement containing scheme-wise verified registration counts, incentive per student rates, total earnings, and payout transaction history.
            </p>
          </div>

          <button
            onClick={() => handleDownloadReport('incentives')}
            disabled={downloading === 'incentives'}
            className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiDownload />
            {downloading === 'incentives' ? 'Generating CSV...' : 'Download Incentive Statement'}
          </button>
        </div>
      </div>
    </div>
  )
}
