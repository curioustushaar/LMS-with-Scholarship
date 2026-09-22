'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { FiMenu, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiRefreshCw, FiExternalLink } from 'react-icons/fi'

interface NavItem {
  id: string
  name: string
  href: string
  sort_order: number
  is_visible: boolean
  is_external?: boolean
}

export default function SuperadminNavbarPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<NavItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    sort_order: 1,
    is_visible: true,
    is_external: false,
  })

  const getToken = async () => await getClientAuthToken()

  const fetchItems = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/navbar', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setItems(data.data)
      } else {
        // Fallback default 10 navbar items
        setItems([
          { id: '1', name: 'Home', href: '/', sort_order: 1, is_visible: true },
          { id: '2', name: 'About', href: '/about', sort_order: 2, is_visible: true },
          { id: '3', name: 'Courses', href: '/courses', sort_order: 3, is_visible: true },
          { id: '4', name: 'Internships', href: '/internships', sort_order: 4, is_visible: true },
          { id: '5', name: 'Scholarships', href: '/scholarships', sort_order: 5, is_visible: true },
          { id: '6', name: 'Notice', href: '#notices', sort_order: 6, is_visible: true },
          { id: '7', name: 'School Partners', href: '/school-partners', sort_order: 7, is_visible: true },
          { id: '8', name: 'Employers', href: '/employers', sort_order: 8, is_visible: true },
          { id: '9', name: 'Admissions', href: '/admissions', sort_order: 9, is_visible: true },
          { id: '10', name: 'Contact', href: '/contact', sort_order: 10, is_visible: true },
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const toggleVisibility = async (item: NavItem) => {
    const updated = items.map((i) => (i.id === item.id ? { ...i, is_visible: !i.is_visible } : i))
    setItems(updated)
    try {
      const token = await getToken()
      await fetch('/api/superadmin/navbar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: item.id, is_visible: !item.is_visible }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      const token = await getToken()
      await fetch('/api/superadmin/navbar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(items),
      })
      alert('Navbar configuration updated successfully!')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      href: '',
      sort_order: items.length + 1,
      is_visible: true,
      is_external: false,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: NavItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      href: item.href,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      is_external: item.is_external || false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingItem) {
        // Edit
        await fetch('/api/superadmin/navbar', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingItem.id, ...formData }),
        })
        setItems(items.map((i) => (i.id === editingItem.id ? { ...i, ...formData } : i)))
      } else {
        // Create
        const res = await fetch('/api/superadmin/navbar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.data) {
          setItems([...items, data.data])
        } else {
          setItems([...items, { id: Date.now().toString(), ...formData }])
        }
      }
      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navbar item?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/navbar?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(items.filter((i) => i.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Update sort_orders
    newItems.forEach((item, idx) => {
      item.sort_order = idx + 1
    })

    setItems(newItems)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiMenu className="text-[#C81E4E]" />
            Navbar Control
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reorder, rename, show or hide links in the public main navigation header
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchItems}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="px-4 py-2 bg-[#C81E4E] hover:bg-[#A3163E] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save Reorder'}
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
          >
            <FiPlus />
            Add Nav Item
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading navbar configuration...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Label</th>
                  <th className="px-6 py-4">URL / Path</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Move</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">#{item.sort_order || idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {item.name}
                        {item.is_external && <FiExternalLink className="text-gray-400 text-xs" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-purple-600 bg-purple-50/30 rounded inline-block my-3 px-2 py-1">
                      {item.href}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVisibility(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.is_visible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {item.is_visible ? (
                          <>
                            <FiEye size={12} /> Visible
                          </>
                        ) : (
                          <>
                            <FiEyeOff size={12} /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-30"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === items.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 disabled:opacity-30"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? 'Edit Navbar Item' : 'Add New Navbar Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Careers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#C81E4E]/20 focus:border-[#C81E4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target URL / Route</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /careers or https://..."
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-[#C81E4E]/20 focus:border-[#C81E4E]"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="rounded text-[#C81E4E] focus:ring-[#C81E4E]"
                  />
                  <span>Show in Navbar</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_external}
                    onChange={(e) => setFormData({ ...formData, is_external: e.target.checked })}
                    className="rounded text-[#C81E4E] focus:ring-[#C81E4E]"
                  />
                  <span>External Link</span>
                </label>
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
