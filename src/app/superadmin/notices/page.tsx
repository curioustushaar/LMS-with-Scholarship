'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FiBell, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiUploadCloud, 
  FiFileText, 
  FiImage, 
  FiPaperclip, 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiCheck, 
  FiAlertCircle, 
  FiX, 
  FiExternalLink 
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface Notice {
  id: string
  title: string
  category: string
  badge_text: string
  description: string
  content?: string
  file_url?: string
  file_type?: string
  file_name?: string
  file_size?: string
  is_pinned: boolean
  is_active: boolean
  views_count?: number
  published_at?: string
  created_at?: string
  updated_at?: string
}

const CATEGORIES = ['All', 'Scholarship', 'Admissions', 'Examination', 'Event', 'Urgent', 'General']
const BADGE_OPTIONS = ['NEW', 'IMPORTANT', 'URGENT', 'EVENT', 'OFFICIAL', 'REVISED']

export default function SuperadminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    badge_text: 'NEW',
    description: '',
    content: '',
    file_url: '',
    file_type: '',
    file_name: '',
    file_size: '',
    is_pinned: false,
    is_active: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchNotices()
  }, [selectedCategory, statusFilter])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchNotices = async () => {
    setLoading(true)
    try {
      let url = '/api/superadmin/notices?'
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`
      if (statusFilter !== 'all') url += `status=${statusFilter}&`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && data.data) {
        setNotices(data.data)
      } else {
        setNotices([])
      }
    } catch (err: any) {
      console.error('Error fetching notices:', err)
      showToast('Failed to load notices', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingNotice(null)
    setFormData({
      title: '',
      category: 'Scholarship',
      badge_text: 'NEW',
      description: '',
      content: '',
      file_url: '',
      file_type: '',
      file_name: '',
      file_size: '',
      is_pinned: false,
      is_active: true,
    })
    setIsCreateModalOpen(true)
  }

  const handleOpenEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title || '',
      category: notice.category || 'General',
      badge_text: notice.badge_text || 'NEW',
      description: notice.description || '',
      content: notice.content || notice.description || '',
      file_url: notice.file_url || '',
      file_type: notice.file_type || '',
      file_name: notice.file_name || '',
      file_size: notice.file_size || '',
      is_pinned: !!notice.is_pinned,
      is_active: notice.is_active !== false,
    })
    setIsCreateModalOpen(true)
  }

  // File Upload Handler for JPG, PNG, WEBP, and PDF
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 20MB
    if (file.size > 20 * 1024 * 1024) {
      showToast('File size must be under 20MB', 'error')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/superadmin/notices/upload', {
        method: 'POST',
        body: uploadFormData,
      })
      const data = await res.json()

      if (data.success && data.file_url) {
        setFormData((prev) => ({
          ...prev,
          file_url: data.file_url,
          file_name: data.file_name || file.name,
          file_type: data.file_type || file.type,
          file_size: data.file_size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        }))
        showToast('Attachment uploaded successfully!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      console.error('File upload error:', err)
      showToast(err.message || 'Error uploading file', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      showToast('Notice title is required', 'error')
      return
    }

    setSaving(true)
    try {
      if (editingNotice) {
        // Update existing notice
        const res = await fetch('/api/superadmin/notices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNotice.id, ...formData }),
        })
        const data = await res.json()
        if (data.success) {
          showToast('Notice updated successfully!')
          setIsCreateModalOpen(false)
          fetchNotices()
        } else {
          throw new Error(data.error || 'Update failed')
        }
      } else {
        // Create new notice
        const res = await fetch('/api/superadmin/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          showToast('Official notice published successfully!')
          setIsCreateModalOpen(false)
          fetchNotices()
        } else {
          throw new Error(data.error || 'Creation failed')
        }
      }
    } catch (err: any) {
      console.error('Error saving notice:', err)
      showToast(err.message || 'Error saving notice', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (notice: Notice) => {
    try {
      const updatedStatus = !notice.is_active
      const res = await fetch('/api/superadmin/notices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notice.id, is_active: updatedStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setNotices(notices.map((n) => (n.id === notice.id ? { ...n, is_active: updatedStatus } : n)))
        showToast(updatedStatus ? 'Notice is now Live & Visible' : 'Notice hidden from public view')
      }
    } catch (err) {
      showToast('Failed to update status', 'error')
    }
  }

  const handleTogglePin = async (notice: Notice) => {
    try {
      const updatedPinned = !notice.is_pinned
      const res = await fetch('/api/superadmin/notices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notice.id, is_pinned: updatedPinned }),
      })
      const data = await res.json()
      if (data.success) {
        setNotices(notices.map((n) => (n.id === notice.id ? { ...n, is_pinned: updatedPinned } : n)))
        showToast(updatedPinned ? 'Notice pinned to top' : 'Notice unpinned')
      }
    } catch (err) {
      showToast('Failed to update pin status', 'error')
    }
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this official notice?')) return

    try {
      const res = await fetch(`/api/superadmin/notices?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setNotices(notices.filter((n) => n.id !== id))
        showToast('Notice deleted successfully')
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete notice', 'error')
    }
  }

  const filteredNotices = notices.filter((n) => {
    if (!searchQuery.trim()) return true
    return (
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toastMessage.type === 'success' ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <FiBell size={13} />
            <span>Official Communications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Notices & <span className="bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] bg-clip-text text-transparent">Announcements</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Publish official circulars, examination notifications, and event posters in JPG or PDF. Instant sync to public landing page.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchNotices}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
            title="Refresh list"
          >
            <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 bg-gradient-to-r from-[#C81E4E] via-[#E11D48] to-[#F43F5E] hover:brightness-110 text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-600/30 flex items-center gap-2 transition-all"
          >
            <FiPlus size={16} />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Total Notices</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{notices.length}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-500 uppercase">Active / Live</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{notices.filter(n => n.is_active).length}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-amber-500 uppercase">Pinned on Top</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{notices.filter(n => n.is_pinned).length}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-purple-500 uppercase">With Attachments</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{notices.filter(n => !!n.file_url).length}</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter and Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-500"
          >
            <option value="all">All Status</option>
            <option value="active">Live (Active)</option>
            <option value="hidden">Hidden</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-pink-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notices Table / Cards */}
      {loading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
          <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-pink-500" />
          <p className="text-xs font-bold">Loading notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-100">
          <div className="w-14 h-14 bg-pink-50 text-[#C81E4E] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiBell size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">No Notices Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You have not created any notices matching your current filter. Click Publish Notice to broadcast an official announcement.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-[#C81E4E] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Publish First Notice
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-4 px-5">Notice Details</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Attachment / Poster</th>
                  <th className="py-4 px-4">Pinned</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredNotices.map((notice) => {
                  const isImage = notice.file_type?.startsWith('image/') || (notice.file_url && /\.(jpg|jpeg|png|webp)/i.test(notice.file_url))
                  const isPdf = notice.file_type === 'pdf' || (notice.file_url && /\.pdf/i.test(notice.file_url)) || notice.file_name?.toLowerCase().endsWith('.pdf')

                  return (
                    <tr key={notice.id} className="hover:bg-pink-50/20 transition-colors">
                      {/* Title & Description */}
                      <td className="py-4 px-5 max-w-md">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            <FiBell size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-gray-900 text-[13px]">{notice.title}</h4>
                              {notice.badge_text && (
                                <span className="px-1.5 py-0.5 rounded bg-pink-100 text-[#C81E4E] font-extrabold text-[9px]">
                                  {notice.badge_text}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{notice.description}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              Published: {notice.published_at ? new Date(notice.published_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          {notice.category}
                        </span>
                      </td>

                      {/* Attachment Preview */}
                      <td className="py-4 px-4">
                        {notice.file_url ? (
                          <div className="flex items-center gap-2">
                            {isImage ? (
                              <button
                                onClick={() => setPreviewNotice(notice)}
                                className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0 group relative cursor-pointer"
                                title="Click to preview poster"
                              >
                                <img src={notice.file_url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <FiEye size={12} />
                                </div>
                              </button>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#9C27FF] flex items-center justify-center shrink-0 font-bold border border-purple-100">
                                <FiFileText size={16} />
                              </div>
                            )}
                            <div className="min-w-0 max-w-[120px]">
                              <p className="text-[11px] font-bold text-gray-800 truncate" title={notice.file_name || 'Document'}>
                                {notice.file_name || (isImage ? 'Poster Image' : 'PDF Circular')}
                              </p>
                              <span className="text-[9px] text-gray-400 block">
                                {notice.file_size || (isPdf ? 'PDF File' : 'Image')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No File</span>
                        )}
                      </td>

                      {/* Pin Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePin(notice)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            notice.is_pinned
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-gray-100 text-gray-400 hover:text-gray-700'
                          }`}
                        >
                          {notice.is_pinned ? '📌 Pinned' : 'Pin'}
                        </button>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(notice)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                            notice.is_active
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${notice.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {notice.is_active ? 'Live' : 'Hidden'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewNotice(notice)}
                            className="p-2 rounded-xl text-gray-500 hover:text-[#C81E4E] hover:bg-pink-50 transition-all"
                            title="Preview Notice"
                          >
                            <FiEye size={14} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(notice)}
                            className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Edit Notice"
                          >
                            <FiEdit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete Notice"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Notice Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingNotice ? 'Edit Official Notice' : 'Publish Official Notice / Poster'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Broadcast an announcement or circular to the public landing page.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveNotice} className="mt-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Notice Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. STEM Excellence Scholarship Examination 2026 Schedule Announced"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-pink-500 focus:bg-white"
                  />
                </div>

                {/* Category & Badge Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-pink-500"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge Highlight</label>
                    <select
                      value={formData.badge_text}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-pink-500"
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brief Summary / Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Brief Summary / Circular Highlights <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short 2-3 lines summarizing the key instructions or notice overview..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:bg-white"
                  />
                </div>

                {/* Extended Details / Content (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Notice Body / Circular Content (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full detailed text, guidelines, dates, test center rules, or circular text..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-pink-500 focus:bg-white"
                  />
                </div>

                {/* File / Poster Upload Box (JPG, PNG, PDF) */}
                <div className="p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <FiPaperclip className="text-pink-500" />
                      Attach JPG Poster or PDF Circular
                    </label>
                    <span className="text-[10px] text-gray-400 font-semibold">Supports .jpg, .png, .pdf (Max 20MB)</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                  />

                  {formData.file_url ? (
                    <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {formData.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)/i.test(formData.file_url) ? (
                          <img src={formData.file_url} alt="" className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#9C27FF] flex items-center justify-center shrink-0">
                            <FiFileText size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{formData.file_name || 'Uploaded File'}</p>
                          <span className="text-[10px] text-gray-400 font-medium">{formData.file_size || 'Attached'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={formData.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-pink-600 rounded-lg"
                        >
                          <FiExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, file_url: '', file_name: '', file_size: '', file_type: '' })}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="py-6 text-center cursor-pointer hover:bg-gray-100/60 rounded-xl transition-all"
                    >
                      <FiUploadCloud className="mx-auto text-2xl text-gray-400 mb-1" />
                      <p className="text-xs font-bold text-gray-700">
                        {uploading ? 'Uploading file...' : 'Click to Upload Poster or PDF'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Click here to browse your computer</p>
                    </div>
                  )}
                </div>

                {/* Toggles Row */}
                <div className="pt-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-xs font-bold text-gray-700">Pin to Top of Notice Board</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-gray-700">Make Public Immediately (Live)</span>
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/30 hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? 'Saving Notice...' : editingNotice ? 'Save Changes' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewNotice(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setPreviewNotice(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
              >
                <FiX size={16} />
              </button>

              <div className="flex items-center gap-2 mb-3 pr-8">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#C81E4E] border border-pink-100">
                  {previewNotice.category}
                </span>
                {previewNotice.badge_text && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-pink-100 text-[#C81E4E]">
                    {previewNotice.badge_text}
                  </span>
                )}
                {previewNotice.is_pinned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    📌 Pinned
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-gray-900 leading-snug">{previewNotice.title}</h3>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">{previewNotice.description}</p>

              {previewNotice.content && (
                <div className="mt-4 p-4 rounded-2xl bg-gray-50 text-xs text-gray-600 whitespace-pre-line border border-gray-100">
                  {previewNotice.content}
                </div>
              )}

              {previewNotice.file_url && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Attached File</span>
                  {previewNotice.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)/i.test(previewNotice.file_url) ? (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-80 bg-gray-50">
                      <img src={previewNotice.file_url} alt="" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-[#9C27FF]" size={20} />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{previewNotice.file_name || 'Circular.pdf'}</p>
                          <span className="text-[10px] text-gray-500">PDF Document</span>
                        </div>
                      </div>
                      <a
                        href={previewNotice.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#9C27FF] text-white text-xs font-bold rounded-lg"
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setPreviewNotice(null)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
