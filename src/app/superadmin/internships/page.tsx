'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import {
  FiBriefcase,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiRefreshCw,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
} from 'react-icons/fi'

interface Internship {
  id: string
  role_title: string
  company_name: string
  location?: string
  work_type: 'remote' | 'onsite' | 'hybrid'
  duration?: string
  stipend?: string
  description?: string
  status: 'active' | 'closed' | 'upcoming'
}

interface InternshipApp {
  id: string
  internship_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  resume_url?: string
  cover_letter?: string
  status: 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected'
  created_at: string
  role_title?: string
  company_name?: string
}

export default function SuperadminInternshipsPage() {
  const [tab, setTab] = useState<'openings' | 'applications'>('openings')
  const [internships, setInternships] = useState<Internship[]>([])
  const [applications, setApplications] = useState<InternshipApp[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Internship | null>(null)

  const [formData, setFormData] = useState<Partial<Internship>>({
    role_title: '',
    company_name: '',
    location: 'Remote',
    work_type: 'remote',
    duration: '6 Months',
    stipend: '₹15,000 / month',
    description: '',
    status: 'active',
  })

  const getToken = async () => await getClientAuthToken()

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/internships', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setInternships(data.data)
      } else {
        setInternships([
          {
            id: '1',
            role_title: 'Frontend Developer Intern',
            company_name: 'TechVerve Solutions',
            location: 'Bangalore / Remote',
            work_type: 'remote',
            duration: '6 Months',
            stipend: '₹15,000 / month',
            description: 'Work with React, Next.js, and modern UI libraries to ship features.',
            status: 'active',
          },
          {
            id: '2',
            role_title: 'UI/UX Design Intern',
            company_name: 'Creative Minds',
            location: 'Mumbai',
            work_type: 'hybrid',
            duration: '3 Months',
            stipend: '₹12,000 / month',
            description: 'Design wireframes, high-fidelity prototypes, and user flows in Figma.',
            status: 'active',
          },
          {
            id: '3',
            role_title: 'Data Analyst Intern',
            company_name: 'DataWave Analytics',
            location: 'Hyderabad',
            work_type: 'remote',
            duration: '6 Months',
            stipend: '₹18,000 / month',
            description: 'Analyze student engagement metrics, build automated dashboards with Python/SQL.',
            status: 'active',
          },
        ])
      }

      // Default mock applications for preview
      setApplications([
        {
          id: 'int-app-1',
          internship_id: '1',
          role_title: 'Frontend Developer Intern',
          company_name: 'TechVerve Solutions',
          applicant_name: 'Aanya Sharma',
          applicant_email: 'aanya.sharma@example.com',
          applicant_phone: '+91 9876543210',
          resume_url: 'https://github.com/aanya-dev',
          status: 'shortlisted',
          created_at: new Date().toISOString(),
        },
        {
          id: 'int-app-2',
          internship_id: '2',
          role_title: 'UI/UX Design Intern',
          company_name: 'Creative Minds',
          applicant_name: 'Rohan Verma',
          applicant_email: 'rohan.v@example.com',
          applicant_phone: '+91 9811223344',
          resume_url: 'https://behance.net/rohan-designs',
          status: 'applied',
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
      role_title: '',
      company_name: '',
      location: 'Remote',
      work_type: 'remote',
      duration: '6 Months',
      stipend: '₹15,000 / month',
      description: '',
      status: 'active',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: Internship) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingItem) {
        await fetch('/api/superadmin/internships', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        })
        setInternships(internships.map((i) => (i.id === editingItem.id ? ({ ...i, ...formData } as Internship) : i)))
      } else {
        const res = await fetch('/api/superadmin/internships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.data) {
          setInternships([...internships, data.data])
        } else {
          setInternships([...internships, { id: Date.now().toString(), ...formData } as Internship])
        }
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/internships?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setInternships(internships.filter((i) => i.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateAppStatus = (appId: string, status: any) => {
    setApplications(applications.map((a) => (a.id === appId ? { ...a, status } : a)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBriefcase className="text-[#C81E4E]" />
            Internships & Placement
          </h1>
          <p className="text-sm text-gray-500 mt-1">Publish corporate openings and review candidate applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw />
            Refresh
          </button>
          {tab === 'openings' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <FiPlus />
              Post Internship
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setTab('openings')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'openings' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Active Openings ({internships.length})
          {tab === 'openings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
        <button
          onClick={() => setTab('applications')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'applications' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Candidate Applications ({applications.length})
          {tab === 'applications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
      </div>

      {/* Grid or Table */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading internships...
        </div>
      ) : tab === 'openings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      item.work_type === 'remote'
                        ? 'bg-pink-50 text-[#FF2D8D] border border-pink-100'
                        : item.work_type === 'hybrid'
                        ? 'bg-purple-50 text-[#9C27FF] border border-purple-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
                    {item.work_type}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      item.status === 'active' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    ● {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">{item.role_title}</h3>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">{item.company_name}</p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>

                <div className="space-y-1.5 pt-3 border-t border-gray-50 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <FiClock size={12} /> Duration:
                    </span>
                    <span className="font-semibold text-gray-800">{item.duration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1">
                      <FiDollarSign size={12} /> Stipend:
                    </span>
                    <span className="font-semibold text-emerald-600">{item.stipend || 'Unpaid'}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <FiMapPin size={12} /> Location:
                      </span>
                      <span className="font-semibold text-gray-800">{item.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-50">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Role & Company</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Resume / Profile</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Recruitment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{app.applicant_name}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-purple-700">
                      <div>{app.role_title}</div>
                      <div className="text-gray-400 font-normal">{app.company_name}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{app.applicant_email}</div>
                      <div className="text-gray-400">{app.applicant_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {app.resume_url ? (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#FF2D8D] font-semibold flex items-center gap-1 hover:underline"
                        >
                          View Resume <FiExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          app.status === 'selected'
                            ? 'bg-emerald-50 text-emerald-700'
                            : app.status === 'shortlisted'
                            ? 'bg-purple-50 text-purple-700'
                            : app.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'shortlisted')}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'selected')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
                        >
                          Hire
                        </button>
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? 'Edit Internship' : 'Post New Internship'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={formData.role_title}
                  onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="e.g. Backend Node.js Intern"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#C81E4E]/20 focus:border-[#C81E4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Type</label>
                  <select
                    value={formData.work_type}
                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 6 Months"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stipend</label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="e.g. ₹15,000 / month"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Delhi NCR / Remote"
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
                  placeholder="Overview of duties and project scopes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="active">Active (Open)</option>
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
                  Save Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
