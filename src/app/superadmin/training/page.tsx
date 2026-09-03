'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import {
  FiTarget,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiMail,
} from 'react-icons/fi'

interface TrainingProgram {
  id: string
  title: string
  program_type: 'workshop' | 'bootcamp' | 'certification' | 'seminar' | 'corporate'
  duration?: string
  mode: 'online' | 'offline' | 'hybrid'
  fee?: string
  trainer_name?: string
  max_participants?: number
  current_participants?: number
  description?: string
  status: 'active' | 'closed' | 'upcoming'
}

interface TrainingParticipant {
  id: string
  program_id: string
  program_title: string
  participant_name: string
  participant_email: string
  participant_phone?: string
  organization?: string
  status: 'registered' | 'confirmed' | 'attended' | 'cancelled'
  created_at: string
}

export default function SuperadminTrainingPage() {
  const [tab, setTab] = useState<'programs' | 'participants'>('programs')
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [participants, setParticipants] = useState<TrainingParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<TrainingProgram | null>(null)

  const [formData, setFormData] = useState<Partial<TrainingProgram>>({
    title: '',
    program_type: 'bootcamp',
    duration: '8 Weeks',
    mode: 'online',
    fee: '₹8,999',
    trainer_name: 'Industry Expert',
    max_participants: 50,
    current_participants: 20,
    description: '',
    status: 'active',
  })

  const getToken = async () => await getClientAuthToken()

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/training', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setPrograms(data.data)
      } else {
        setPrograms([
          {
            id: '1',
            title: 'React.js & Next.js Production Masterclass',
            program_type: 'bootcamp',
            duration: '8 Weeks',
            mode: 'online',
            fee: '₹8,999',
            trainer_name: 'Rahul Verma (Lead Architect)',
            max_participants: 50,
            current_participants: 38,
            description: 'Hands-on architectural bootcamp building live fullstack apps with server actions and Supabase.',
            status: 'active',
          },
          {
            id: '2',
            title: 'AWS Certified Cloud Practitioner Bootcamp',
            program_type: 'certification',
            duration: '4 Weeks',
            mode: 'online',
            fee: '₹6,499',
            trainer_name: 'Priya Sharma (AWS Certified)',
            max_participants: 40,
            current_participants: 28,
            description: 'Exam preparation with practice labs, cloud architecture simulations, and test series.',
            status: 'active',
          },
          {
            id: '3',
            title: 'Growth Marketing & AI Tools Weekend Workshop',
            program_type: 'workshop',
            duration: '2 Days',
            mode: 'hybrid',
            fee: '₹2,999',
            trainer_name: 'Ankit Gupta (Growth Lead)',
            max_participants: 30,
            current_participants: 18,
            description: 'Learn modern performance marketing, automation workflows, and AI generation techniques.',
            status: 'upcoming',
          },
        ])
      }

      setParticipants([
        {
          id: 'tr-p-1',
          program_id: '1',
          program_title: 'React.js & Next.js Production Masterclass',
          participant_name: 'Aanya Sharma',
          participant_email: 'aanya.sharma@example.com',
          participant_phone: '+91 9876543210',
          organization: 'Infosys Developer',
          status: 'confirmed',
          created_at: new Date().toISOString(),
        },
        {
          id: 'tr-p-2',
          program_id: '2',
          program_title: 'AWS Certified Cloud Practitioner Bootcamp',
          participant_name: 'Rohan Verma',
          participant_email: 'rohan.v@example.com',
          participant_phone: '+91 9811223344',
          organization: 'Delhi University Student',
          status: 'registered',
          created_at: new Date().toISOString(),
        },
      ])
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
    setEditingItem(null)
    setFormData({
      title: '',
      program_type: 'bootcamp',
      duration: '4 Weeks',
      mode: 'online',
      fee: 'Free',
      trainer_name: '',
      max_participants: 50,
      current_participants: 0,
      description: '',
      status: 'active',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: TrainingProgram) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingItem) {
        await fetch('/api/superadmin/training', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        })
        setPrograms(programs.map((p) => (p.id === editingItem.id ? ({ ...p, ...formData } as TrainingProgram) : p)))
      } else {
        const res = await fetch('/api/superadmin/training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.data) {
          setPrograms([...programs, data.data])
        } else {
          setPrograms([...programs, { id: Date.now().toString(), ...formData } as TrainingProgram])
        }
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training program?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/training?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setPrograms(programs.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateParticipantStatus = (pId: string, status: any) => {
    setParticipants(participants.map((p) => (p.id === pId ? { ...p, status } : p)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiTarget className="text-[#C81E4E]" />
            Corporate & Upskilling Training
          </h1>
          <p className="text-sm text-gray-500 mt-1">Organize bootcamps, workshops, and manage cohort participants</p>
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
              Create Training
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
          Training Cohorts ({programs.length})
          {tab === 'programs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
        <button
          onClick={() => setTab('participants')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'participants' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Registered Participants ({participants.length})
          {tab === 'participants' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
      </div>

      {/* Grid or Table */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading training cohorts...
        </div>
      ) : tab === 'programs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {prog.program_type} • {prog.mode}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      prog.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    ● {prog.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">{prog.title}</h3>
                  <p className="text-xs font-medium text-gray-500 mt-1">Mentor: {prog.trainer_name || 'TBA'}</p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3">{prog.description}</p>

                <div className="space-y-1.5 pt-3 border-t border-gray-50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-800">{prog.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Enrollment:</span>
                    <span className="font-semibold text-gray-800">
                      {prog.current_participants || 0} / {prog.max_participants || '∞'} seats
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="font-bold text-[#FF2D8D]">{prog.fee || 'Free'}</span>
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
        /* Participants Table */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Training Cohort</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{p.participant_name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-purple-700">{p.program_title}</td>
                    <td className="px-6 py-4 text-xs">
                      <div>{p.participant_email}</div>
                      <div className="text-gray-400">{p.participant_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-800">{p.organization || 'Independent'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          p.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.status === 'attended'
                            ? 'bg-blue-50 text-blue-700'
                            : p.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateParticipantStatus(p.id, 'confirmed')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateParticipantStatus(p.id, 'attended')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold"
                        >
                          Mark Attended
                        </button>
                        <button
                          onClick={() => handleUpdateParticipantStatus(p.id, 'cancelled')}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold"
                        >
                          Cancel
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? 'Edit Training Program' : 'Create Training Program'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Next.js Enterprise Masterclass"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Program Type</label>
                  <select
                    value={formData.program_type}
                    onChange={(e) => setFormData({ ...formData, program_type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="certification">Certification</option>
                    <option value="seminar">Seminar</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="online">Online Live</option>
                    <option value="offline">In-Person Campus</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 6 Weeks"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fee</label>
                  <input
                    type="text"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    placeholder="e.g. ₹5,999"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Trainer / Instructor</label>
                  <input
                    type="text"
                    value={formData.trainer_name}
                    onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Seats</label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Syllabus, prerequisites, and learning outcomes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
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
