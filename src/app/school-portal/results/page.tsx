'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiCheckSquare,
  FiAward,
  FiTrendingUp,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiPrinter,
  FiAlertCircle,
} from 'react-icons/fi'

export default function SchoolResultsPage() {
  const searchParams = useSearchParams()
  const initialScheme = searchParams.get('scholarship_id') || 'ALL'

  const [results, setResults] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [schemes, setSchemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedScheme, setSelectedScheme] = useState(initialScheme)
  const [searchQuery, setSearchQuery] = useState('')

  // Scorecard modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showScorecardModal, setShowScorecardModal] = useState(false)

  const getToken = async () => await getSchoolClientAuthToken()

  const fetchResults = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      let url = `/api/school/results?scholarship_id=${selectedScheme}`
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) {
        setResults(data.results || [])
        setStats(data.stats || {})
        setSchemes(data.schemes || [])
      }
    } catch (err) {
      console.error('Fetch school results error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [selectedScheme])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchResults()
  }

  const exportResultsCSV = () => {
    if (results.length === 0) return
    const headers = [
      'Roll Number',
      'Student Name',
      'School Roll No',
      'Class',
      'Section',
      'Scholarship Scheme',
      'Marks Obtained',
      'Total Marks',
      'Percentage',
      'Rank',
      'Merit Status',
      'Award Amount',
    ]

    const rows = results.map((r) => [
      r.roll_number,
      `"${r.applicant_name}"`,
      r.school_roll_number || '',
      r.school_class || '',
      r.school_section || 'A',
      `"${r.scholarship_title}"`,
      r.exam_marks !== null ? r.exam_marks : 'N/A',
      r.total_marks || 100,
      r.percentage_score || 'N/A',
      r.rank || 'N/A',
      r.merit_status ? r.merit_status.toUpperCase() : 'WAITING',
      `"${r.award_amount || 'N/A'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `School_Exam_Results_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiCheckSquare className="text-emerald-600" />
            School Exam Results & Rankings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Exam performance, merit ranks, and official scorecards for students enrolled by your school
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportResultsCSV}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiDownload /> Export Results CSV
          </button>
          <button
            onClick={fetchResults}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Result Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Enrolled</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total_registered || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Appeared</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{stats.total_appeared || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Qualified</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.total_qualified || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Not Qualified</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.total_not_qualified || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Highest Marks</span>
          <p className="text-2xl font-extrabold text-pink-700 mt-1">{stats.highest_marks || 0}/100</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Average Score</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{stats.average_marks || 0}%</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search result by student name, roll number, or school roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2D8D]"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-500">Scheme:</span>
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700"
          >
            <option value="ALL">All Schemes</option>
            {schemes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">Loading student results...</div>
        ) : results.length === 0 ? (
          <div className="p-16 text-center text-gray-400 space-y-2">
            <p className="text-base font-bold text-gray-700">No exam results available yet.</p>
            <p className="text-xs max-w-sm mx-auto">
              Results will be visible here once Super Admin evaluates and publishes the official scholarship scores.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Merit Rank</th>
                  <th className="px-4 py-3.5">Roll Number</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Class / Sec</th>
                  <th className="px-4 py-3.5">Scheme</th>
                  <th className="px-4 py-3.5">Score (%)</th>
                  <th className="px-4 py-3.5">Result Status</th>
                  <th className="px-4 py-3.5">Award / Perks</th>
                  <th className="px-4 py-3.5 text-right">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="px-4 py-3.5">
                      {r.rank ? (
                        <span className="font-extrabold text-purple-700 text-sm">#{r.rank}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-purple-700">
                      {r.roll_number}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {r.applicant_name}
                    </td>

                    <td className="px-4 py-3.5 text-gray-600">
                      {r.school_class} ({r.school_section || 'A'})
                    </td>

                    <td className="px-4 py-3.5 text-gray-800 font-medium">
                      {r.scholarship_title}
                    </td>

                    <td className="px-4 py-3.5">
                      {r.exam_marks !== null ? (
                        <div>
                          <span className="font-bold text-gray-900">{r.exam_marks}/{r.total_marks || 100}</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">{r.percentage_score}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Absent / Pending</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.merit_status === 'qualified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : r.merit_status === 'not_qualified'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r.merit_status ? r.merit_status.toUpperCase() : 'WAITING'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {r.award_amount ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50/75 px-2 py-0.5 rounded">
                          {r.award_amount}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Standard Evaluation</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(r)
                          setShowScorecardModal(true)
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <FiEye size={13} />
                        Scorecard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Scorecard Modal */}
      {showScorecardModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                  Official Examination Scorecard
                </span>
                <h3 className="text-lg font-bold text-gray-900">{selectedStudent.scholarship_title}</h3>
              </div>
              <button onClick={() => setShowScorecardModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedStudent.applicant_name}</h4>
                  <p className="text-xs text-gray-500 font-mono">Roll Number: {selectedStudent.roll_number}</p>
                  <p className="text-xs text-gray-500">Class: {selectedStudent.school_class} ({selectedStudent.school_section || 'A'})</p>
                </div>
                {selectedStudent.rank && (
                  <div className="text-center p-2 bg-white rounded-xl shadow-sm border border-emerald-100">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Merit Rank</span>
                    <span className="text-xl font-extrabold text-purple-700">#{selectedStudent.rank}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/50 text-center text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">Marks</span>
                  <span className="font-extrabold text-gray-900 text-base">{selectedStudent.exam_marks || 0}/{selectedStudent.total_marks || 100}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Percentage</span>
                  <span className="font-extrabold text-emerald-700 text-base">{selectedStudent.percentage_score || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Result</span>
                  <span className="font-extrabold text-emerald-700 text-base">{selectedStudent.merit_status?.toUpperCase() || 'EVALUATED'}</span>
                </div>
              </div>
            </div>

            {selectedStudent.award_amount && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs">
                <span className="font-bold text-purple-900 block mb-1">🏆 Award & Scholarship Recognition</span>
                <p className="text-purple-800 font-semibold">{selectedStudent.award_amount}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
              >
                <FiPrinter /> Print Scorecard
              </button>
              <button
                onClick={() => setShowScorecardModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
