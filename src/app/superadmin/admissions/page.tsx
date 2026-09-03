'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { FiUserPlus, FiPlus, FiEdit2, FiTrash2, FiUsers, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiBookOpen } from 'react-icons/fi'

interface AdmissionProgram {
  id: string
  program_name: string
  description?: string
  eligibility?: string
  duration?: string
  fee_structure?: string
  seats_available: number
  application_deadline?: string
  status: 'active' | 'closed' | 'upcoming'
}

interface Application {
  id: string
  admission_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  qualification?: string
  percentage?: number
  message?: string
  status: 'pending' | 'under_review' | 'accepted' | 'rejected'
  created_at: string
  admissions?: { program_name: string }
}

export default function SuperadminAdmissionsPage() {
  const [tab, setTab] = useState<'programs' | 'applications'>('programs')
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<AdmissionProgram | null>(null)

  const [formData, setFormData] = useState<Partial<AdmissionProgram>>({
    program_name: '',
    description: '',
    eligibility: '',
    duration: '',
    fee_structure: '',
    seats_available: 50,
    status: 'active',
  })

  const getToken = async () => await getClientAuthToken()

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const [progRes, appRes] = await Promise.all([
        fetch('/api/superadmin/admissions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/superadmin/admission-applications', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const progData = await progRes.json()
      const appData = await appRes.json()

      if (progData.success && progData.data?.length > 0) {
        setPrograms(progData.data)
      } else {
        // Fallback default programs
        setPrograms([
          {
            id: '1',
            program_name: 'B.Tech Computer Science & AI',
            duration: '4 Years',
            eligibility: '10+2 PCM (60%)',
            fee_structure: '₹1,20,000 / year',
            seats_available: 120,
            status: 'active',
            description: 'Core computer science curriculum integrated with Machine Learning, Cloud, and Full Stack development.',
          },
          {
            id: '2',
            program_name: 'Bachelor of Computer Applications (BCA)',
            duration: '3 Years',
            eligibility: '10+2 Mathematics (50%)',
            fee_structure: '₹80,000 / year',
            seats_available: 60,
            status: 'active',
            description: 'Undergraduate professional program focused on software engineering and modern web stacks.',
          },
          {
            id: '3',
            program_name: 'Full Stack Engineering Diploma',
            duration: '6 Months',
            eligibility: 'Graduate in any stream',
            fee_structure: '₹45,000 one-time',
            seats_available: 40,
            status: 'active',
            description: 'Intensive job-oriented training bootcamp with corporate project deliverables.',
          },
        ])
      }

      if (appData.success && appData.data?.length > 0) {
        setApplications(appData.data)
      } else {
        setApplications([
          {
            id: 'app-1',
            admission_id: '1',
            applicant_name: 'Aanya Sharma',
            applicant_email: 'aanya.sharma@example.com',
            applicant_phone: '+91 9876543210',
            qualification: '12th Grade CBSE',
            percentage: 92.4,
            status: 'under_review',
            created_at: new Date().toISOString(),
            admissions: { program_name: 'B.Tech Computer Science & AI' },
          },
          {
            id: 'app-2',
            admission_id: '2',
            applicant_name: 'Rohan Verma',
            applicant_email: 'rohan.v@example.com',
            applicant_phone: '+91 9811223344',
            qualification: '12th Grade ICSE',
            percentage: 84.5,
            status: 'pending',
            created_at: new Date().toISOString(),
            admissions: { program_name: 'Bachelor of Computer Applications (BCA)' },
          },
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setEditingProgram(null)
    setFormData({
      program_name: '',
      description: '',
      eligibility: '',
      duration: '',
      fee_structure: '',
      seats_available: 60,
      status: 'active',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (prog: AdmissionProgram) => {
    setEditingProgram(prog)
    setFormData(prog)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingProgram) {
        await fetch('/api/superadmin/admissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingProgram.id, ...formData }),
        })
        setPrograms(programs.map((p) => (p.id === editingProgram.id ? ({ ...p, ...formData } as AdmissionProgram) : p)))
      } else {
        const res = await fetch('/api/superadmin/admissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.data) {
          setPrograms([...programs, data.data])
        } else {
          setPrograms([...programs, { id: Date.now().toString(), ...formData } as AdmissionProgram])
        }
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/admissions?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setPrograms(programs.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusUpdate = async (appId: string, status: 'pending' | 'under_review' | 'accepted' | 'rejected') => {
    try {
      const token = await getToken()
      await fetch('/api/superadmin/admission-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: appId, status }),
      })
      setApplications(applications.map((a) => (a.id === appId ? { ...a, status } : a)))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUserPlus className="text-[#C81E4E]" />
            Admissions & Intakes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage academic programs, eligibility, fee structure, and review incoming student applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw />
            Refresh
          </button>
          {tab === 'programs' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <FiPlus />
              Add Program
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setTab('programs')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'programs' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Programs & Courses ({programs.length})
          {tab === 'programs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
        <button
          onClick={() => setTab('applications')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'applications' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Student Applications ({applications.length})
          {tab === 'applications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading admissions data...
        </div>
      ) : tab === 'programs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      prog.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {prog.status}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <FiUsers size={13} /> {prog.seats_available} seats
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-snug">{prog.program_name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{prog.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-gray-50 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-800">{prog.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eligibility:</span>
                    <span className="font-semibold text-gray-800">{prog.eligibility || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="font-semibold text-[#C81E4E]">{prog.fee_structure || 'Free'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-50">
                <button
                  onClick={() => handleOpenEdit(prog)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(prog.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Applications Table */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Target Program</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Score / Qual</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{app.applicant_name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-purple-700">
                      {app.admissions?.program_name || 'General Admission'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{app.applicant_email}</div>
                      <div className="text-gray-400">{app.applicant_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{app.qualification || 'N/A'}</div>
                      {app.percentage && <div className="font-bold text-emerald-600">{app.percentage}% Score</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          app.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700'
                            : app.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : app.status === 'under_review'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'under_review')}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Program */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingProgram ? 'Edit Admission Program' : 'Add New Admission Program'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  value={formData.program_name}
                  onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                  placeholder="e.g. Master of Business Administration"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#C81E4E]/20 focus:border-[#C81E4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of the program..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#C81E4E]/20 focus:border-[#C81E4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 4 Years / 6 Months"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Seats Available</label>
                  <input
                    type="number"
                    value={formData.seats_available}
                    onChange={(e) => setFormData({ ...formData, seats_available: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Eligibility</label>
                  <input
                    type="text"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    placeholder="e.g. 10+2 PCM min 60%"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fee Structure</label>
                  <input
                    type="text"
                    value={formData.fee_structure}
                    onChange={(e) => setFormData({ ...formData, fee_structure: e.target.value })}
                    placeholder="e.g. ₹95,000 / year"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="active">Active (Open for Admissions)</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
