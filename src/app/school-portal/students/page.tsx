'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiUsers,
  FiPlus,
  FiUploadCloud,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiFileText,
  FiEye,
  FiPrinter,
  FiCheck,
  FiX,
  FiShield,
} from 'react-icons/fi'

export default function SchoolStudentsPage() {
  const searchParams = useSearchParams()
  const initialScheme = searchParams.get('scholarship_id') || 'ALL'

  const [students, setStudents] = useState<any[]>([])
  const [schemes, setSchemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedScheme, setSelectedScheme] = useState(initialScheme)
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Multi-select for Bulk Approval / Rejection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  // View Student Inspection & Hall Ticket Modal
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [showHallTicketModal, setShowHallTicketModal] = useState(false)

  // Rejection Reason Modal
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingIds, setRejectingIds] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')

  const getToken = async () => await getSchoolClientAuthToken()

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      let url = `/api/school/students?scholarship_id=${selectedScheme}&class=${selectedClass}&approval_status=${approvalFilter}`
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`

      const [studentsRes, schemesRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/school/scholarships', { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const studentsData = await studentsRes.json()
      const schemesData = await schemesRes.json()

      if (studentsData.success) {
        setStudents(studentsData.data || [])
      }
      if (schemesData.success) {
        setSchemes(schemesData.data || [])
      }
      setSelectedIds([])
    } catch (err) {
      console.error('Fetch school students error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [selectedScheme, selectedClass, approvalFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStudents()
  }

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(students.map((s) => s.id))
    }
  }

  // Approve Students (Single or Bulk)
  const handleApprove = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to APPROVE ${ids.length} student(s)? This authorizes their Hall Tickets to be released.`)) {
      return
    }

    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'APPROVE', student_ids: ids }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Students approved successfully!')
        setShowInspectionModal(false)
        fetchStudents()
      } else {
        alert(data.error || 'Failed to approve students')
      }
    } catch (err: any) {
      alert(err.message || 'Error approving students')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Rejection Dialog
  const handleOpenReject = (ids: string[]) => {
    setRejectingIds(ids)
    setRejectionReason('Student institutional record not found in school roll or admission registry.')
    setShowRejectModal(true)
  }

  // Confirm Reject Students
  const handleConfirmReject = async () => {
    if (rejectingIds.length === 0) return
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'REJECT',
          student_ids: rejectingIds,
          rejection_reason: rejectionReason,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Students rejected.')
        setShowRejectModal(false)
        setShowInspectionModal(false)
        fetchStudents()
      } else {
        alert(data.error || 'Failed to reject students')
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting students')
    } finally {
      setActionLoading(false)
    }
  }

  // Helper to extract student approval status
  const getStudentApproval = (s: any) => {
    if (s.documents?.school_approval_status) return s.documents.school_approval_status
    if (s.registration_source === 'SCHOOL' && s.documents?.registered_by_school_id) return 'APPROVED'
    return 'PENDING'
  }

  const exportCSV = () => {
    if (students.length === 0) return
    const headers = [
      'Scholarship Roll Number',
      'Student Name',
      'Father Name',
      'School Roll No',
      'Admission No',
      'Class',
      'Section',
      'Scholarship Scheme',
      'Registration Date',
      'School Approval Status',
      'Admit Card Status',
      'Exam Marks',
    ]

    const rows = students.map((s) => [
      s.roll_number || s.application_no,
      `"${s.applicant_name}"`,
      `"${s.father_name || ''}"`,
      s.school_roll_number || s.documents?.school_roll_no || '',
      s.documents?.school_admission_no || '',
      s.school_class || s.qualification || '',
      s.school_section || s.documents?.school_section || 'A',
      `"${s.scholarship_title}"`,
      new Date(s.created_at).toLocaleDateString(),
      getStudentApproval(s),
      s.admit_card_status || 'provisional',
      s.exam_marks !== null ? s.exam_marks : 'N/A',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `School_Students_Verification_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pendingCount = students.filter((s) => getStudentApproval(s) === 'PENDING').length
  const approvedCount = students.filter((s) => getStudentApproval(s) === 'APPROVED').length
  const rejectedCount = students.filter((s) => getStudentApproval(s) === 'REJECTED').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiShield className="text-[#FF2D8D]" />
            Student Verification & Roster ({students.length})
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review student applications, verify Roll No & Admission No, and approve candidates for Admit Card issuance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-xs"
          >
            <FiDownload /> Export CSV
          </button>
          <Link
            href="/school-portal/students/bulk"
            className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-xs"
          >
            <FiUploadCloud /> Bulk Upload
          </Link>
          <Link
            href="/school-portal/students/register"
            className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FiPlus /> Register Student
          </Link>
        </div>
      </div>

      {/* Verification Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => setApprovalFilter('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            approvalFilter === 'PENDING'
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
              : 'bg-white border-gray-100 hover:border-amber-200 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
              Action Required
            </span>
            <h4 className="text-xl font-black text-amber-900 mt-0.5">{pendingCount}</h4>
            <p className="text-[11px] text-amber-700/80 font-medium">Pending Verification</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center text-lg">
            <FiClock />
          </div>
        </button>

        <button
          onClick={() => setApprovalFilter('APPROVED')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            approvalFilter === 'APPROVED'
              ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/40 shadow-xs'
              : 'bg-white border-gray-100 hover:border-emerald-200 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
              Verified & Authorized
            </span>
            <h4 className="text-xl font-black text-emerald-900 mt-0.5">{approvedCount}</h4>
            <p className="text-[11px] text-emerald-700/80 font-medium">Admit Card Authorized</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-lg">
            <FiCheckCircle />
          </div>
        </button>

        <button
          onClick={() => setApprovalFilter('REJECTED')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            approvalFilter === 'REJECTED'
              ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400/40 shadow-xs'
              : 'bg-white border-gray-100 hover:border-red-200 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 block">
              Rejected / Withheld
            </span>
            <h4 className="text-xl font-black text-red-900 mt-0.5">{rejectedCount}</h4>
            <p className="text-[11px] text-red-700/80 font-medium">Admit Card Blocked</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100/80 text-red-700 flex items-center justify-center text-lg">
            <FiXCircle />
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200/60">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setApprovalFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  approvalFilter === tab
                    ? 'bg-white text-gray-900 shadow-xs font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'ALL' ? 'All Students' : tab === 'PENDING' ? '⚠️ Pending Approval' : tab === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-md items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Name, Roll No, Admission No, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FF2D8D]"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-gray-500 font-bold">Scheme:</label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 font-semibold bg-white"
            >
              <option value="ALL">All Associated Scholarships</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-500 font-bold">Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 font-semibold bg-white"
            >
              <option value="ALL">All Classes</option>
              <option value="8th">8th Standard</option>
              <option value="9th">9th Standard</option>
              <option value="10th">10th Standard</option>
              <option value="11th (Science)">11th (Science)</option>
              <option value="11th (Commerce/Arts)">11th (Commerce/Arts)</option>
              <option value="12th (PCM)">12th (PCM)</option>
              <option value="12th (PCB)">12th (PCB)</option>
              <option value="12th (Commerce/Arts)">12th (Commerce/Arts)</option>
              <option value="Undergraduate">Undergraduate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating / Top Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span>Student(s) Selected for Institutional Action</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApprove(selectedIds)}
              disabled={actionLoading}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <FiCheck /> Approve Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => handleOpenReject(selectedIds)}
              disabled={actionLoading}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <FiX /> Reject Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">Loading enrolled students...</div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-gray-400 space-y-3">
            <p className="text-base font-bold text-gray-700">No students found matching the selected filter.</p>
            <p className="text-xs max-w-sm mx-auto">
              Students who register with your School ID on the scholarship portal will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === students.length && students.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5">Candidate Identity</th>
                  <th className="px-4 py-3.5">Institutional Credentials</th>
                  <th className="px-4 py-3.5">Scholarship Scheme</th>
                  <th className="px-4 py-3.5">School Verification Status</th>
                  <th className="px-4 py-3.5">Hall Ticket Status</th>
                  <th className="px-4 py-3.5 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => {
                  const status = getStudentApproval(s)
                  const isSelected = selectedIds.includes(s.id)
                  const admissionNo = s.documents?.school_admission_no || s.documents?.admission_no || 'N/A'
                  const rollNo = s.school_roll_number || s.documents?.school_roll_no || 'N/A'

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-purple-50/20 transition-colors ${
                        isSelected ? 'bg-purple-50/40' : ''
                      }`}
                    >
                      <td className="px-3.5 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={s.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                            alt={s.applicant_name}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-gray-900 text-sm leading-tight">{s.applicant_name}</p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{s.applicant_email}</p>
                            {s.father_name && (
                              <p className="text-[10px] text-gray-400">Father: {s.father_name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-gray-900 text-xs">
                            Class: {s.school_class || s.qualification} • Sec {s.school_section || s.documents?.school_section || 'A'}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="bg-gray-100 text-gray-700 font-mono font-bold px-1.5 py-0.5 rounded">
                              Roll: {rollNo}
                            </span>
                            <span className="bg-purple-50 text-purple-800 font-mono font-bold px-1.5 py-0.5 rounded border border-purple-100">
                              Adm: {admissionNo}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-gray-800 leading-snug">{s.scholarship_title}</p>
                        <span className="font-mono text-[10px] text-gray-400">App No: {s.application_no}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        {status === 'APPROVED' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-black">
                              <FiCheckCircle size={12} /> Approved by School
                            </span>
                            {s.documents?.school_verified_at && (
                              <p className="text-[9px] text-gray-400 font-mono">
                                {new Date(s.documents.school_verified_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : status === 'REJECTED' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg text-[10px] font-black">
                              <FiXCircle size={12} /> Rejected by School
                            </span>
                            {s.documents?.school_rejection_reason && (
                              <p className="text-[9px] text-red-600 line-clamp-1">
                                {s.documents.school_rejection_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-black animate-pulse">
                            <FiAlertCircle size={12} /> ⚠️ Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {status === 'REJECTED' || s.admit_card_status === 'withheld_school_rejected' ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px]">
                            ⛔ Withheld (Rejected)
                          </span>
                        ) : status === 'PENDING' ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-bold text-[10px]">
                            ⏳ Awaiting School
                          </span>
                        ) : s.admit_card_status === 'released' || s.roll_number ? (
                          <button
                            onClick={() => {
                              setSelectedStudent(s)
                              setShowHallTicketModal(true)
                            }}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-[11px] font-black transition-colors inline-flex items-center gap-1 border border-emerald-200"
                          >
                            <FiEye size={12} />
                            Released ({s.roll_number || 'Official'})
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold text-[10px]">
                            Authorized for Batch
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(s)
                              setShowInspectionModal(true)
                            }}
                            className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Inspect Student Dossier"
                          >
                            <FiFileText size={15} />
                          </button>

                          {status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove([s.id])}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black transition-colors shadow-xs"
                                title="Approve Student"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReject([s.id])}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[11px] font-black transition-colors"
                                title="Reject Student"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {status === 'APPROVED' && (
                            <button
                              onClick={() => handleOpenReject([s.id])}
                              className="px-2 py-1 text-gray-400 hover:text-red-600 text-[10px] font-bold rounded hover:bg-red-50 transition-colors"
                              title="Revert to Rejected"
                            >
                              Reject
                            </button>
                          )}

                          {status === 'REJECTED' && (
                            <button
                              onClick={() => handleApprove([s.id])}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-black transition-colors"
                              title="Re-Approve Student"
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: STUDENT DOSSIER INSPECTION MODAL */}
      {showInspectionModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-purple-700 uppercase bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  Institutional Candidate Verification
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">{selectedStudent.applicant_name}</h3>
                <p className="text-xs text-gray-400">{selectedStudent.scholarship_title}</p>
              </div>
              <button onClick={() => setShowInspectionModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                ✕
              </button>
            </div>

            {/* Candidate Identity Overview */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
              <img
                src={selectedStudent.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'}
                alt={selectedStudent.applicant_name}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-xs shrink-0"
              />
              <div className="space-y-1 text-xs">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-gray-700">App No: <strong className="font-mono text-gray-900">{selectedStudent.application_no}</strong></span>
                  <span className="text-gray-300">•</span>
                  <span className="font-bold text-gray-700">Reg Code: <strong className="font-mono text-purple-700">{selectedStudent.registration_code}</strong></span>
                </div>
                <p className="text-gray-600 font-medium">Email: <span className="font-mono text-gray-900">{selectedStudent.applicant_email}</span></p>
                <p className="text-gray-600 font-medium">Phone: <span className="font-mono text-gray-900">{selectedStudent.applicant_phone}</span></p>
                <p className="text-gray-600 font-medium">Father / Guardian: <strong className="text-gray-900">{selectedStudent.father_name || 'N/A'}</strong></p>
              </div>
            </div>

            {/* Institutional School Verification Details */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
              <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                Institutional Roster Details Submitted by Candidate:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">School Roll No</span>
                  <p className="font-mono font-black text-purple-900 text-sm mt-0.5">
                    {selectedStudent.school_roll_number || selectedStudent.documents?.school_roll_no || 'N/A'}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Admission / S.R. No</span>
                  <p className="font-mono font-black text-purple-900 text-sm mt-0.5">
                    {selectedStudent.documents?.school_admission_no || selectedStudent.documents?.admission_no || 'N/A'}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Class / Standard</span>
                  <p className="font-black text-gray-900 text-sm mt-0.5">
                    {selectedStudent.school_class || selectedStudent.qualification}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Section</span>
                  <p className="font-black text-gray-900 text-sm mt-0.5">
                    {selectedStudent.school_section || selectedStudent.documents?.school_section || 'A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              getStudentApproval(selectedStudent) === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : getStudentApproval(selectedStudent) === 'REJECTED'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                {getStudentApproval(selectedStudent) === 'APPROVED' ? (
                  <>
                    <FiCheckCircle className="text-emerald-700 text-base" />
                    <span>This candidate is APPROVED by your school. Hall Ticket authorization is active.</span>
                  </>
                ) : getStudentApproval(selectedStudent) === 'REJECTED' ? (
                  <>
                    <FiXCircle className="text-red-700 text-base" />
                    <span>This candidate is REJECTED by your school. Hall Ticket is withheld.</span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-amber-700 text-base" />
                    <span>Pending school authority approval. Please verify Admission & Roll numbers.</span>
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenReject([selectedStudent.id])}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black transition-colors flex items-center gap-1"
                >
                  <FiX /> Reject Candidate
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove([selectedStudent.id])}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
                >
                  <FiCheck /> Approve & Authorize Admit Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <FiXCircle size={22} />
              <h3 className="text-lg font-black text-gray-900">Reject Student Verification</h3>
            </div>
            <p className="text-xs text-gray-500">
              Rejecting {rejectingIds.length} candidate(s) will block their examination Admit Card issuance.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Admission number mismatch / student not enrolled in selected class."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICIAL HALL TICKET MODAL */}
      {showHallTicketModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest block ${
                  selectedStudent.admit_card_status === 'released' || selectedStudent.roll_number ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {selectedStudent.admit_card_status === 'released' || selectedStudent.roll_number ? 'Official Examination Admit Card' : 'Provisional Registration Pass'}
                </span>
                <h3 className="text-lg font-black text-gray-900">{selectedStudent.scholarship_title}</h3>
              </div>
              <button onClick={() => setShowHallTicketModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-start gap-4">
              <img
                src={selectedStudent.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'}
                alt={selectedStudent.applicant_name}
                className="w-20 h-20 rounded-2xl object-cover border border-purple-200 shadow-sm"
              />
              <div className="space-y-1 text-xs">
                <p className="text-base font-extrabold text-gray-900">{selectedStudent.applicant_name}</p>
                <p>
                  <span className="text-gray-500 font-bold">App No: </span>
                  <span className="font-mono font-bold text-gray-900">{selectedStudent.application_no}</span>
                </p>
                <p>
                  <span className="text-gray-500 font-bold">Registration Code: </span>
                  <span className="font-mono font-bold text-purple-700">{selectedStudent.registration_code || 'N/A'}</span>
                </p>
                <p>
                  <span className="text-gray-500 font-bold">Exam Roll Number: </span>
                  {selectedStudent.roll_number ? (
                    <span className="font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{selectedStudent.roll_number}</span>
                  ) : (
                    <span className="text-blue-700 font-semibold italic">Approved by School • Pending Superadmin Roll Allocation</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-gray-50 rounded-2xl">
              <div>
                <span className="text-gray-400 text-[10px]">Class & Sec:</span>
                <p className="font-bold text-gray-800 mt-0.5">{selectedStudent.school_class || selectedStudent.qualification} (Sec {selectedStudent.school_section || selectedStudent.documents?.school_section || 'A'})</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">School Roll No:</span>
                <p className="font-mono font-bold text-gray-900 mt-0.5">{selectedStudent.school_roll_number || selectedStudent.documents?.school_roll_no || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">School Verification:</span>
                <p className="font-bold text-emerald-700 mt-0.5">✅ VERIFIED & APPROVED</p>
              </div>
              <div>
                <span className="text-gray-400 text-[10px]">Admit Card Status:</span>
                <p className={`font-bold mt-0.5 ${
                  selectedStudent.admit_card_status === 'released' || selectedStudent.roll_number ? 'text-emerald-700' : 'text-blue-700'
                }`}>
                  {selectedStudent.admit_card_status === 'released' || selectedStudent.roll_number ? '● Official Released' : 'Authorized for Batch Release'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {(selectedStudent.admit_card_status === 'released' || selectedStudent.roll_number) && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <FiPrinter /> Print Official Hall Ticket
                </button>
              )}
              <button
                onClick={() => setShowHallTicketModal(false)}
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
