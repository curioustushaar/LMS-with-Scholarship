'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiAward,
  FiPlus,
  FiUploadCloud,
  FiCheckSquare,
  FiUsers,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiRefreshCw,
  FiArrowRight,
} from 'react-icons/fi'

export default function SchoolScholarshipsPage() {
  const [scholarships, setScholarships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getToken = async () => await getSchoolClientAuthToken()

  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/scholarships', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setScholarships(json.data || [])
      }
    } catch (err) {
      console.error('Fetch school scholarships error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiAward className="text-[#FF2D8D]" />
            Associated Scholarship Schemes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scholarships officially assigned to your school by Super Admin for student enrollment & exams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchScholarships}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href="/school-portal/students/bulk"
            className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <FiUploadCloud />
            Bulk CSV Upload
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
          Loading assigned scholarship programs...
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 space-y-2">
          <p className="text-base font-bold text-gray-700">No Scholarships Associated Yet</p>
          <p className="text-xs max-w-md mx-auto">
            Your school has not been assigned any active scholarships yet. Please contact the platform Super Admin to associate scholarship schemes with your school.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scholarships.map((sch) => (
            <div
              key={sch.assignment_id || sch.scholarship_id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {sch.category || 'National Merit Scheme'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                    <FiDollarSign size={13} /> School Incentive: ₹{sch.incentive_per_verified_registration}/student
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">{sch.title}</h2>
                  <p className="text-xs text-pink-600 font-semibold mt-1">{sch.scholarship_value}</p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {sch.description || 'Premier scholarship scheme providing tuition fee waivers and merit cash awards.'}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50/75 rounded-2xl text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Reg. Fee</span>
                    <span className="font-extrabold text-gray-900">₹{sch.registration_fee}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Exam Date</span>
                    <span className="font-bold text-gray-900">{sch.exam_date ? new Date(sch.exam_date).toLocaleDateString() : 'TBA'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Enrolled Students</span>
                    <span className="font-extrabold text-purple-700">{sch.students_registered || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Incentive Earned</span>
                    <span className="font-extrabold text-emerald-700">₹{sch.incentive_earned || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/school-portal/students/register?scheme=${sch.scholarship_id}`}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  <FiPlus />
                  Enroll Individual
                </Link>
                <Link
                  href={`/school-portal/students/bulk?scheme=${sch.scholarship_id}`}
                  className="px-4 py-2.5 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <FiUploadCloud />
                  Bulk CSV
                </Link>
                <Link
                  href={`/school-portal/students?scholarship_id=${sch.scholarship_id}`}
                  className="px-3.5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <FiUsers />
                  View Students ({sch.students_registered || 0})
                </Link>
                <Link
                  href={`/school-portal/results?scholarship_id=${sch.scholarship_id}`}
                  className="px-3.5 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <FiCheckSquare />
                  Exam Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
