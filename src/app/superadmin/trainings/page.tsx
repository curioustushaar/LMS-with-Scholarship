'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import * as XLSX from 'xlsx'
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiVideo,
  FiUsers,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
  FiUploadCloud,
  FiSearch,
  FiDownload,
  FiCopy,
  FiCheck,
  FiEye,
} from 'react-icons/fi'

interface Workshop {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  duration_type: '1_day' | '3_days' | '1_week' | 'custom'
  duration_badge: string
  start_date?: string
  end_date?: string
  timing: string
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams'
  meeting_link: string
  meeting_id?: string
  passcode?: string
  instructor_name?: string
  instructor_role?: string
  status: 'published' | 'draft' | 'completed'
  max_seats?: number
  registration_count?: number
  created_at?: string
}

interface WorkshopRegistration {
  id: string
  workshop_id: string
  workshop_title?: string
  name: string
  email: string
  phone: string
  course?: string
  branch?: string
  status?: string
  registered_at: string
}

export default function SuperadminTrainingsPage() {
  const [activeTab, setActiveTab] = useState<'workshops' | 'registrations'>('workshops')
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [registrations, setRegistrations] = useState<WorkshopRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Filters
  const [searchRegQuery, setSearchRegQuery] = useState('')
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('all')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Workshop | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<Workshop>>({
    title: '',
    description: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    duration_type: '3_days',
    duration_badge: '3 Days Workshop',
    start_date: '',
    end_date: '',
    timing: '06:00 PM - 08:00 PM IST',
    platform: 'Google Meet',
    meeting_link: '',
    meeting_id: '',
    passcode: '',
    instructor_name: 'Dr. Anand Kumar',
    instructor_role: 'Lead Cloud Architect & Ex-Google',
    status: 'published',
    max_seats: 100,
  })

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const getToken = async () => await getClientAuthToken()

  // Fetch Workshops
  const fetchWorkshops = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/trainings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setWorkshops(data.data)
      }
    } catch (err) {
      console.error('Fetch workshops error:', err)
    }
  }

  // Fetch Registrations
  const fetchRegistrations = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/trainings/registrations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setRegistrations(data.data)
      }
    } catch (err) {
      console.error('Fetch registrations error:', err)
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([fetchWorkshops(), fetchRegistrations()])
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      duration_type: '3_days',
      duration_badge: '3 Days Workshop',
      start_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      timing: '06:00 PM - 08:30 PM IST',
      platform: 'Google Meet',
      meeting_link: '',
      meeting_id: '',
      passcode: '',
      instructor_name: 'Dr. Anand Kumar',
      instructor_role: 'Lead Cloud Architect',
      status: 'published',
      max_seats: 100,
    })
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (ws: Workshop) => {
    setEditingItem(ws)
    setFormData({
      title: ws.title || '',
      description: ws.description || '',
      thumbnail_url: ws.thumbnail_url || '',
      duration_type: ws.duration_type || '3_days',
      duration_badge: ws.duration_badge || '3 Days Workshop',
      start_date: ws.start_date || '',
      end_date: ws.end_date || '',
      timing: ws.timing || '',
      platform: ws.platform || 'Google Meet',
      meeting_link: ws.meeting_link || '',
      meeting_id: ws.meeting_id || '',
      passcode: ws.passcode || '',
      instructor_name: ws.instructor_name || '',
      instructor_role: ws.instructor_role || '',
      status: ws.status || 'published',
      max_seats: ws.max_seats || 100,
    })
    setShowModal(true)
  }

  // Handle Thumbnail File Upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      showToast('Image size must be under 15MB', 'error')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/superadmin/trainings/upload', {
        method: 'POST',
        body: uploadFormData,
      })
      const data = await res.json()

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, thumbnail_url: data.url }))
        showToast('Thumbnail uploaded successfully!')
      } else {
        showToast(data.error || 'Failed to upload image', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Upload error', 'error')
    } finally {
      setUploading(false)
    }
  }

  // Handle Duration Type change
  const handleDurationTypeChange = (type: '1_day' | '3_days' | '1_week' | 'custom') => {
    let badge = 'Live Workshop'
    if (type === '1_day') badge = '1 Day Masterclass'
    else if (type === '3_days') badge = '3 Days Workshop'
    else if (type === '1_week') badge = '1 Week Bootcamp'

    setFormData((prev) => ({
      ...prev,
      duration_type: type,
      duration_badge: type === 'custom' ? prev.duration_badge || 'Workshop' : badge,
    }))
  }

  // Save Workshop (Create / Update)
  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim() || !formData.meeting_link?.trim()) {
      showToast('Please provide Workshop Title and Meeting Link', 'error')
      return
    }

    setSaving(true)
    try {
      const token = await getToken()
      const method = editingItem ? 'PUT' : 'POST'
      const payload = editingItem ? { id: editingItem.id, ...formData } : formData

      const res = await fetch('/api/superadmin/trainings', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        showToast(editingItem ? 'Workshop updated!' : 'Workshop published successfully!')
        setShowModal(false)
        await fetchWorkshops()
      } else {
        showToast(data.error || 'Failed to save workshop', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving workshop', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete Workshop
  const handleDeleteWorkshop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workshop? All associated registration records will also be removed.')) {
      return
    }

    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/trainings?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        showToast('Workshop deleted successfully')
        setWorkshops((prev) => prev.filter((w) => w.id !== id))
      } else {
        showToast(data.error || 'Failed to delete', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Delete error', 'error')
    }
  }

  // Delete Registration
  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Remove this student registration record?')) return

    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/trainings/registrations?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        showToast('Registration removed')
        setRegistrations((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (err: any) {
      showToast('Error removing registration', 'error')
    }
  }

  // Copy Link
  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    showToast('Meeting link copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Export to Excel using XLSX
  const exportToExcel = () => {
    if (filteredRegistrations.length === 0) {
      showToast('No registrations found to export', 'error')
      return
    }

    const rows = filteredRegistrations.map((reg, idx) => ({
      'S.No': idx + 1,
      'Student Name': reg.name,
      'Course': reg.course || 'Not specified',
      'Branch': reg.branch || 'Not specified',
      'Mobile Number': reg.phone,
      'Email Address': reg.email,
      'Workshop Title': reg.workshop_title || 'Workshop',
      'Registration Date': new Date(reg.registered_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      'Status': reg.status || 'registered',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Workshop Registrations')

    // Auto-size columns
    const maxProps = ['S.No', 'Student Name', 'Course', 'Branch', 'Mobile Number', 'Email Address', 'Workshop Title', 'Registration Date', 'Status']
    worksheet['!cols'] = maxProps.map((key) => ({ wch: Math.max(key.length + 4, 20) }))

    const fileName = `Workshop_Students_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
    showToast(`Exported ${filteredRegistrations.length} students to ${fileName}`)
  }

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesWorkshop = selectedWorkshopFilter === 'all' || reg.workshop_id === selectedWorkshopFilter
    const q = searchRegQuery.toLowerCase()
    const matchesQuery =
      !q ||
      reg.name.toLowerCase().includes(q) ||
      reg.email.toLowerCase().includes(q) ||
      reg.phone.includes(q) ||
      (reg.course && reg.course.toLowerCase().includes(q)) ||
      (reg.branch && reg.branch.toLowerCase().includes(q)) ||
      (reg.workshop_title && reg.workshop_title.toLowerCase().includes(q))
    return matchesWorkshop && matchesQuery
  })

  // Quick stats
  const totalPublished = workshops.filter((w) => w.status === 'published').length
  const totalRegistrationsCount = workshops.reduce((acc, w) => acc + (w.registration_count || 0), 0) || registrations.length

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#FF2D8D]/10 to-[#9C27FF]/10 text-[#FF2D8D]">
              <FiVideo size={22} />
            </span>
            Workshops & Training Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Publish 1-day, 3-day or 1-week masterclasses, set live Google Meet / Zoom links, and manage student registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            disabled={loading}
            className="p-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl bg-white shadow-sm hover:shadow transition"
            title="Refresh Data"
          >
            <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <FiPlus size={16} />
            Create Workshop
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Workshops</span>
            <span className="p-2 rounded-lg bg-pink-50 text-[#FF2D8D]">
              <FiCalendar size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{workshops.length}</p>
          <span className="text-[10px] text-gray-400">Created masterclasses</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Live / Published</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FiCheckCircle size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalPublished}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Visible on website</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Registrations</span>
            <span className="p-2 rounded-lg bg-purple-50 text-[#9C27FF]">
              <FiUsers size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalRegistrationsCount}</p>
          <span className="text-[10px] text-gray-400">Enrolled student leads</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Delivery Mode</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FiVideo size={14} />
            </span>
          </div>
          <p className="text-sm font-bold text-gray-800 mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Meet & Zoom Live
          </p>
          <span className="text-[10px] text-gray-400">Automated access link</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('workshops')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'workshops'
              ? 'text-[#FF2D8D] border-b-2 border-[#FF2D8D]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Workshops & Masterclasses ({workshops.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'registrations'
              ? 'text-[#FF2D8D] border-b-2 border-[#FF2D8D]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Registered Students ({registrations.length})
        </button>
      </div>

      {/* Tab 1: Workshops Grid */}
      {activeTab === 'workshops' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              <div className="w-8 h-8 border-2 border-[#FF2D8D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading workshops...
            </div>
          ) : workshops.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FiVideo size={36} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-sm font-bold text-gray-700">No Workshops Created Yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Create your first workshop (1-day masterclass, 3-day workshop or 1-week bootcamp) with Zoom/Meet link.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-4 px-4 py-2 bg-[#FF2D8D] text-white text-xs font-bold rounded-xl shadow hover:opacity-95"
              >
                + Create Workshop Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((ws) => (
                <div
                  key={ws.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail banner with badges */}
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={ws.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                        alt={ws.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-gray-900 shadow">
                          {ws.duration_badge}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            ws.status === 'published'
                              ? 'bg-emerald-500 text-white shadow'
                              : 'bg-amber-500 text-white shadow'
                          }`}
                        >
                          {ws.status === 'published' ? '● Published' : 'Draft'}
                        </span>
                      </div>

                      {/* Bottom Banner Info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1 font-semibold text-[11px] drop-shadow">
                          <FiVideo size={13} className="text-[#FF2D8D]" />
                          {ws.platform}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[11px] bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
                          <FiUsers size={12} />
                          {ws.registration_count || 0} Registered
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2">
                        {ws.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {ws.description || 'Hands-on practical training session with industry experts.'}
                      </p>

                      {/* Meta attributes */}
                      <div className="pt-2 border-t border-gray-50 space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                            <FiClock size={12} /> Timings:
                          </span>
                          <span className="font-semibold text-gray-800 text-[11px]">{ws.timing}</span>
                        </div>
                        {ws.start_date && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                              <FiCalendar size={12} /> Date:
                            </span>
                            <span className="font-medium text-gray-700 text-[11px]">
                              {ws.start_date} {ws.end_date && ws.end_date !== ws.start_date ? `to ${ws.end_date}` : ''}
                            </span>
                          </div>
                        )}
                        {ws.instructor_name && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-[11px]">Instructor:</span>
                            <span className="font-medium text-gray-700 text-[11px] truncate max-w-[170px]">
                              {ws.instructor_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meeting Link Preview */}
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live Link</p>
                          <p className="text-[11px] font-mono text-purple-700 truncate">{ws.meeting_link}</p>
                        </div>
                        <button
                          onClick={() => handleCopyLink(ws.meeting_link, ws.id)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                          title="Copy Link"
                        >
                          {copiedId === ws.id ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedWorkshopFilter(ws.id)
                        setActiveTab('registrations')
                      }}
                      className="text-xs font-bold text-[#9C27FF] hover:underline flex items-center gap-1"
                    >
                      <FiUsers size={13} />
                      View Students ({ws.registration_count || 0})
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(ws)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                        title="Edit Workshop"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkshop(ws.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Workshop"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Registered Students Table */}
      {activeTab === 'registrations' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Workshop selector filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold">Workshop:</span>
                <select
                  value={selectedWorkshopFilter}
                  onChange={(e) => setSelectedWorkshopFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FF2D8D]"
                >
                  <option value="all">All Workshops ({registrations.length})</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title.substring(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Search input */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search student, email, phone..."
                  value={searchRegQuery}
                  onChange={(e) => setSearchRegQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF2D8D] w-56 sm:w-64"
                />
              </div>
            </div>

            {/* Excel Export Button */}
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition self-start sm:self-auto"
            >
              <FiDownload size={15} />
              Export to Excel ({filteredRegistrations.length})
            </button>
          </div>

          {/* Table */}
          {filteredRegistrations.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              <FiUsers size={30} className="mx-auto text-gray-300 mb-2" />
              No student registrations found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Course & Branch</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Workshop</th>
                    <th className="py-3 px-4">Registered At</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredRegistrations.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF2D8D]/20 to-[#9C27FF]/20 text-[#FF2D8D] font-bold text-xs flex items-center justify-center shrink-0">
                          {reg.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        {reg.name}
                      </td>
                      <td className="py-3.5 px-4">
                        {reg.course || reg.branch ? (
                          <div className="space-y-0.5">
                            {reg.course && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-[#FF2D8D] border border-pink-100">
                                {reg.course}
                              </span>
                            )}
                            {reg.branch && (
                              <p className="text-[11px] font-medium text-gray-600">
                                {reg.branch}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Not provided</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">{reg.phone}</td>
                      <td className="py-3.5 px-4 text-gray-600">{reg.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-[#9C27FF] border border-purple-100 line-clamp-1 max-w-[220px]">
                          {reg.workshop_title || 'Live Workshop'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(reg.registered_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRegistration(reg.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove Registration"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-4.5 border-b border-gray-100 bg-white shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  {editingItem ? 'Edit Workshop' : 'Create & Publish New Workshop'}
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                  Set live Zoom or Google Meet links and configure proper duration & timing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition text-sm font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveWorkshop} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Workshop Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Days Full Stack Next.js 14 Masterclass"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>

                {/* Duration Type selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: '1_day', label: '1 Day Masterclass' },
                    { key: '3_days', label: '3 Days Workshop' },
                    { key: '1_week', label: '1 Week Bootcamp' },
                    { key: 'custom', label: 'Custom Duration' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => handleDurationTypeChange(item.key as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        formData.duration_type === item.key
                          ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white border-transparent shadow'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Duration Badge Custom Text & Timing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Duration Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.duration_badge}
                      onChange={(e) => setFormData({ ...formData, duration_badge: e.target.value })}
                      placeholder="e.g. 3 Days Workshop"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#FF2D8D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Daily Timings *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.timing}
                      onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                      placeholder="e.g. 06:00 PM - 08:30 PM IST"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#FF2D8D]"
                    />
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#FF2D8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#FF2D8D]"
                    />
                  </div>
                </div>

                {/* Platform & Meeting Link */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Platform</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#FF2D8D]"
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Meeting URL (Zoom / Meet) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/..."
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#FF2D8D]"
                    />
                  </div>
                </div>

                {/* Meeting ID & Passcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Meeting ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 987 654 3210"
                      value={formData.meeting_id}
                      onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Passcode (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. GRAVITY2026"
                      value={formData.passcode}
                      onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Instructor Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Instructor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Anand Kumar"
                      value={formData.instructor_name}
                      onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Instructor Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Ex-Google Cloud Architect"
                      value={formData.instructor_role}
                      onChange={(e) => setFormData({ ...formData, instructor_role: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Thumbnail Upload & Preview */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Workshop Thumbnail / Poster Image
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {formData.thumbnail_url && (
                      <div className="w-24 h-16 rounded-xl border overflow-hidden shrink-0 bg-gray-50">
                        <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition">
                        <FiUploadCloud size={16} />
                        {uploading ? 'Uploading...' : 'Choose Poster Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailUpload}
                          disabled={uploading}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste external image URL..."
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description / Topics Covered
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detail the curriculum, hands-on project work, prerequisites, and takeaway skills..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#FF2D8D]"
                  />
                </div>

                {/* Status & Max Seats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Publish Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    >
                      <option value="published">Published (Visible on Home & Training page)</option>
                      <option value="draft">Draft (Saved privately)</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Max Seats Capacity</label>
                    <input
                      type="number"
                      value={formData.max_seats}
                      onChange={(e) => setFormData({ ...formData, max_seats: parseInt(e.target.value) || 100 })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer (Fixed at bottom) */}
              <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-7 sm:py-4 bg-gray-50/90 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
