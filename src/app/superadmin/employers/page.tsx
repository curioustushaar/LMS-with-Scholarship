'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiGlobe, FiRefreshCw, FiStar } from 'react-icons/fi'

interface Employer {
  id: string
  company_name: string
  industry?: string
  description?: string
  website_url?: string
  contact_email?: string
  location?: string
  partnership_type: 'hiring' | 'training' | 'sponsoring' | 'all'
  is_featured: boolean
  status: 'active' | 'inactive' | 'pending'
}

export default function SuperadminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Employer | null>(null)

  const [formData, setFormData] = useState<Partial<Employer>>({
    company_name: '',
    industry: 'Software & IT',
    description: '',
    location: 'Bangalore, India',
    partnership_type: 'hiring',
    is_featured: true,
    status: 'active',
  })

  const getToken = async () => await getClientAuthToken()

  const fetchEmployers = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/employers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setEmployers(data.data)
      } else {
        setEmployers([
          {
            id: '1',
            company_name: 'TechVerve Solutions',
            industry: 'IT Services & Cloud',
            location: 'Bangalore, India',
            partnership_type: 'hiring',
            is_featured: true,
            status: 'active',
            description: 'Leading IT services provider hiring full-stack developers and DevOps engineers.',
          },
          {
            id: '2',
            company_name: 'Creative Minds Studio',
            industry: 'Design & Media',
            location: 'Mumbai, India',
            partnership_type: 'hiring',
            is_featured: true,
            status: 'active',
            description: 'Global digital product agency recruiting UI/UX designers and creative technologists.',
          },
          {
            id: '3',
            company_name: 'DataWave Analytics',
            industry: 'Data & AI',
            location: 'Hyderabad, India',
            partnership_type: 'training',
            is_featured: true,
            status: 'active',
            description: 'Analytics consulting enterprise conducting sponsored workshops and campus drives.',
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
    fetchEmployers()
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      company_name: '',
      industry: 'Software & IT',
      description: '',
      location: 'Bangalore, India',
      partnership_type: 'hiring',
      is_featured: true,
      status: 'active',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: Employer) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingItem) {
        await fetch('/api/superadmin/employers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        })
        setEmployers(employers.map((emp) => (emp.id === editingItem.id ? ({ ...emp, ...formData } as Employer) : emp)))
      } else {
        const res = await fetch('/api/superadmin/employers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.data) {
          setEmployers([...employers, data.data])
        } else {
          setEmployers([...employers, { id: Date.now().toString(), ...formData } as Employer])
        }
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employer?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/employers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployers(employers.filter((e) => e.id !== id))
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
            <FiUsers className="text-[#C81E4E]" />
            Employers & Hiring Partners
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage recruiting companies, placement tie-ups, and corporate partners</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployers}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <FiPlus />
            Add Employer
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading employer directory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employers.map((emp) => (
            <div key={emp.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {emp.industry || 'Industry'}
                  </span>
                  {emp.is_featured && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <FiStar size={11} className="fill-amber-500" /> Featured
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">{emp.company_name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <FiMapPin size={12} /> {emp.location || 'India'}
                  </p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3">{emp.description}</p>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Partnership:</span>
                  <span className="font-bold uppercase text-gray-800">{emp.partnership_type}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-50">
                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? 'Edit Employer' : 'Add New Employer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Google India"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. FinTech / AI"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
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
                  placeholder="About the company and recruitment drives..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Partnership Type</label>
                  <select
                    value={formData.partnership_type}
                    onChange={(e) => setFormData({ ...formData, partnership_type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="hiring">Hiring Partner</option>
                    <option value="training">Training Partner</option>
                    <option value="sponsoring">Sponsorship Partner</option>
                    <option value="all">Full Strategic Partner</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-[#C81E4E] focus:ring-[#C81E4E]"
                    />
                    <span>Featured on Home</span>
                  </label>
                </div>
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
                  Save Employer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
