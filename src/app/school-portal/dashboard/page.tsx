'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiAward,
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
  FiPlus,
  FiUploadCloud,
  FiArrowRight,
  FiRefreshCw,
  FiClock,
  FiFileText,
} from 'react-icons/fi'

export default function SchoolDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const getToken = async () => await getSchoolClientAuthToken()

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error('Fetch school dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading || !data) {
    return (
      <div className="p-16 text-center text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF2D8D] mx-auto mb-3"></div>
        Loading school dashboard statistics...
      </div>
    )
  }

  const { metrics, assigned_scholarships = [], recent_registrations = [], school } = data

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/10">
            School Partner Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{school.name}</h1>
          <p className="text-xs sm:text-sm text-purple-200">
            School ID: <span className="font-mono font-bold text-white">{school.school_id}</span> • Authorized Contact: {school.contact_person_name} ({school.designation})
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/school-portal/students/register"
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FiPlus />
            Register Student
          </Link>
          <Link
            href="/school-portal/students/bulk"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
          >
            <FiUploadCloud />
            Bulk CSV Upload
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Associated Schemes</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.associated_scholarships_count}</p>
          <span className="text-[10px] text-purple-600 font-semibold">Assigned by Admin</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Enrolled</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.total_students_registered}</p>
          <span className="text-[10px] text-gray-500">School students</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified Entries</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{metrics.total_verified_registrations}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Eligible for incentive</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Exam Appeared</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{metrics.total_exam_participants}</p>
          <span className="text-[10px] text-blue-500">Attended test</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Qualified Merit</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{metrics.total_qualified_students}</p>
          <span className="text-[10px] text-amber-500 font-semibold">Passed & Ranked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Total Incentive</span>
          <p className="text-2xl font-extrabold text-pink-700 mt-1">₹{metrics.total_incentive_earned.toLocaleString()}</p>
          <span className="text-[10px] text-pink-500 font-semibold">Paid: ₹{metrics.total_incentive_paid.toLocaleString()}</span>
        </div>
      </div>

      {/* Associated Scholarships Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiAward className="text-[#FF2D8D]" />
            Assigned Scholarship Schemes ({assigned_scholarships.length})
          </h2>
          <Link
            href="/school-portal/scholarships"
            className="text-xs font-bold text-[#FF2D8D] hover:underline flex items-center gap-1"
          >
            View All Details <FiArrowRight />
          </Link>
        </div>

        {assigned_scholarships.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-400">
            No scholarships assigned yet by Super Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assigned_scholarships.map((assn: any) => (
              <div
                key={assn.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full uppercase">
                      {assn.scheme?.category || 'Merit Scholarship'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Incentive: ₹{assn.incentive_per_verified_registration || 20}/verified
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug">
                    {assn.scheme?.title || 'National Scholarship'}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {assn.scheme?.scholarship_value || 'Tuition Fee Waiver + Cash Grant'}
                  </p>

                  <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px]">Registration Fee:</span>
                      <p className="font-bold text-gray-800">₹{assn.registration_fee || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px]">Students Enrolled:</span>
                      <p className="font-bold text-purple-700">{assn.students_registered || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
                  <Link
                    href={`/school-portal/students/register?scheme=${assn.scholarship_id}`}
                    className="flex-1 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-center rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all"
                  >
                    Enroll Student
                  </Link>
                  <Link
                    href={`/school-portal/results?scholarship_id=${assn.scholarship_id}`}
                    className="px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-purple-600" />
            Recent Student Enrollments
          </h2>
          <Link
            href="/school-portal/students"
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
          >
            Manage All Students <FiArrowRight />
          </Link>
        </div>

        {recent_registrations.length === 0 ? (
          <p className="text-xs text-gray-400 p-6 text-center">No students registered yet. Click "Register Student" above to start.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5">Roll Number</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Class & Section</th>
                  <th className="px-4 py-2.5">Scholarship Scheme</th>
                  <th className="px-4 py-2.5">Registration Date</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent_registrations.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700">
                      {s.roll_number || s.application_no}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">{s.applicant_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.school_class || s.qualification} ({s.school_section || 'A'})
                    </td>
                    <td className="px-4 py-3 text-gray-800">{s.scholarship_title}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                        CONFIRMED
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
