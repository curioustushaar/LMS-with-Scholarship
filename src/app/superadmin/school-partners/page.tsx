'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiStar, FiUsers } from 'react-icons/fi'

interface SchoolPartner {
  id: string
  institution_name: string
  institution_type: 'school' | 'college' | 'university' | 'institute'
  description?: string
  website_url?: string
  location?: string
  students_enrolled?: number
  is_featured: boolean
  status: 'active' | 'inactive' | 'pending'
}

export default function SuperadminSchoolPartnersPage() {
  const [partners, setPartners] = useState<SchoolPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SchoolPartner | null>(null)

  const [formData, setFormData] = useState<Partial<SchoolPartner>>({
    institution_name: '',
    institution_type: 'college',
    description: '',
    location: 'New Delhi, India',
    students_enrolled: 150,
    is_featured: true,
    status: 'active',
  })

  const getToken = async () => await getClientAuthToken()

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/school-partners', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setPartners(data.data)
      } else {
        setPartners([
          {
            id: '1',
            institution_name: 'Delhi Public School',
            institution_type: 'school',
            location: 'New Delhi, India',
            students_enrolled: 250,
            is_featured: true,
            status: 'active',
            description: 'Premier national K-12 institution running integrated AI and coding foundational curriculum.',
          },
          {
            id: '2',
            institution_name: 'IIT Delhi Innovation Hub',
            institution_type: 'university',
            location: 'New Delhi, India',
            students_enrolled: 180,
            is_featured: true,
            status: 'active',
            description: 'Collaborative incubation partner providing advanced research and hackathon mentorship.',
          },
          {
            id: '3',
            institution_name: 'Amity University Tech Campus',
            institution_type: 'university',
            location: 'Noida, India',
            students_enrolled: 320,
            is_featured: true,
            status: 'active',
            description: 'Higher education partner with dual certification and corporate semester programs.',
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
    fetchPartners()
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      institution_name: '',
      institution_type: 'college',
      description: '',
      location: 'New Delhi, India',
      students_enrolled: 100,
      is_featured: true,
      status: 'active',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: SchoolPartner) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingItem) {
        await fetch('/api/superadmin/school-partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        })
        setPartners(partners.map((p) => (p.id === editingItem.id ? ({ ...p, ...formData } as SchoolPartner) : p)))
      } else {
        const res = await fetch('/api/superadmin/school-partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.data) {
          setPartners([...partners, data.data])
        } else {
          setPartners([...partners, { id: Date.now().toString(), ...formData } as SchoolPartner])
        }
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school partner?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/school-partners?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setPartners(partners.filter((p) => p.id !== id))
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
            <FiMapPin className="text-[#C81E4E]" />
            School & Institutional Partners
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage partner schools, colleges, credit transfers, and student quotas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPartners}
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
            Add Institution
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading partner institutions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {p.institution_type}
                  </span>
                  {p.is_featured && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <FiStar size={11} className="fill-amber-500" /> Featured
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">{p.institution_name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <FiMapPin size={12} /> {p.location || 'India'}
                  </p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3">{p.description}</p>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <FiUsers size={13} /> Students Enrolled:
                  </span>
                  <span className="font-bold text-emerald-600">{p.students_enrolled || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-50">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
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
              {editingItem ? 'Edit Institution' : 'Add New Institution Partner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  placeholder="e.g. St. Xavier's College"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Institution Type</label>
                  <select
                    value={formData.institution_type}
                    onChange={(e) => setFormData({ ...formData, institution_type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="school">School (K-12)</option>
                    <option value="college">College</option>
                    <option value="university">University</option>
                    <option value="institute">Training Institute</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Kolkata, India"
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
                  placeholder="Details of collaboration programs..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Students Enrolled</label>
                  <input
                    type="number"
                    value={formData.students_enrolled}
                    onChange={(e) => setFormData({ ...formData, students_enrolled: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
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
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
