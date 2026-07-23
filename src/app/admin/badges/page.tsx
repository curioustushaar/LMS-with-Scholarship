'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiAward, FiX } from 'react-icons/fi'
import { FaTrophy } from 'react-icons/fa'
import { api } from '@/lib/api'

interface Badge {
  id: string
  name: string
  description: string
  category: string
  icon_url: string
  rule_type: string
  rule_value: number
  rule_duration?: number
  created_at: string
  earned_count?: number
}

export default function BadgesPage() {
  const [filterCategory, setFilterCategory] = useState('all')
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState({ total: 0, earned: 0, mostPopular: '-', avgPerStudent: 0 })
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '🏆',
    category: 'achievement',
    rule_type: 'manual',
    rule_value: '1',
    rule_duration: ''
  })

  useEffect(() => {
    loadBadges()
  }, [])

  const loadBadges = async () => {
    try {
      const result = await api.badges.getAll()
      if (result.success && result.data) {
        const badgesData = Array.isArray(result.data) ? result.data : []
        setBadges(badgesData)
        
        const backendStats = (result as any).stats
        setStats({
          total: backendStats?.total ?? badgesData.length,
          earned: backendStats?.earned ?? 0,
          mostPopular: backendStats?.mostPopular ?? (badgesData.length > 0 ? badgesData[0].name : '-'),
          avgPerStudent: backendStats?.avgPerStudent ?? 0
        })
      }
    } catch (error) {
      console.error('Failed to load badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...formData,
      rule_value: parseInt(formData.rule_value),
      rule_duration: formData.rule_duration ? parseInt(formData.rule_duration) : null
    }

    try {
      let result;
      if (editingBadge) {
        result = await api.badges.update(editingBadge.id, payload)
      } else {
        result = await api.badges.create(payload)
      }

      if (result.success) {
        setIsModalOpen(false)
        setEditingBadge(null)
        setFormData({
          name: '',
          description: '',
          icon_url: '🏆',
          category: 'achievement',
          rule_type: 'manual',
          rule_value: '1',
          rule_duration: ''
        })
        loadBadges()
      }
    } catch (error) {
      console.error('Create failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (badge: Badge) => {
    setEditingBadge(badge)
    setFormData({
      name: badge.name,
      description: badge.description || '',
      icon_url: badge.icon_url || '🏆',
      category: badge.category || 'achievement',
      rule_type: badge.rule_type || 'manual',
      rule_value: badge.rule_value.toString(),
      rule_duration: badge.rule_duration?.toString() || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return
    try {
      await api.badges.delete(id)
      loadBadges()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gamification engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Badge Rules Engine</h1>
          <p className="text-gray-600 mt-1">Define automatic triggers for student achievements</p>
        </div>
        <button
          onClick={() => {
            setEditingBadge(null)
            setFormData({
              name: '',
              description: '',
              icon_url: '🏆',
              category: 'achievement',
              rule_type: 'manual',
              rule_value: '1',
              rule_duration: ''
            })
            setIsModalOpen(true)
          }}
          className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <FiPlus className="text-xl" />
          <span>Create New Rule</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Rules</p>
          <p className="text-3xl font-black text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Badges Earned</p>
          <p className="text-3xl font-black text-green-600 mt-1">{stats.earned}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Most Popular</p>
          <p className="text-lg font-bold text-blue-600 mt-2 truncate">{stats.mostPopular}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Avg per Student</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{stats.avgPerStudent}</p>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto max-w-full">
          {['all', 'completion', 'tasks', 'achievement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-white text-[#C81E4E] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {badges.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FiAward className="text-6xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No active badge rules found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {badges
              .filter(b => filterCategory === 'all' || b.category === filterCategory)
              .map((badge) => (
                <div key={badge.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col border border-gray-100 max-h-[400px]">
                  {/* Compact Header */}
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 text-center relative group">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(badge)}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white transition-colors"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(badge.id)}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="text-4xl mb-2 drop-shadow-md flex justify-center items-center h-12">
                      <div className="text-gray-900 w-10 h-10">
                        {badge.icon_url && badge.icon_url.length < 4 && !badge.icon_url.includes('.') ? (
                          <span className="text-4xl">{badge.icon_url}</span>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate px-2">{badge.name}</h3>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold uppercase rounded-full">
                        {badge.category}
                      </span>
                      <span className="text-[9px] font-black text-[#C81E4E] uppercase italic">
                        {badge.rule_type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1">
                      {badge.description}
                    </p>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <FiAward className="text-lg" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{badge.earned_count ?? 0}</p>
                          <p className="text-[9px] uppercase font-bold tracking-tighter">Earned</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Goal</p>
                        <p className="text-[11px] font-bold text-gray-800">
                          {badge.rule_value} {badge.rule_type.split('_')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* COMPACT Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingBadge ? 'Edit Badge Rule' : 'New Badge Rule'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Badge Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none text-sm"
                    placeholder="e.g. Week Warrior"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="achievement">Achievement</option>
                    <option value="completion">Completion</option>
                    <option value="tasks">Tasks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Icon (Emoji/URL)</label>
                  <input
                    type="text"
                    value={formData.icon_url}
                    onChange={e => setFormData({ ...formData, icon_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 grid grid-cols-2 gap-3">
                <div className="col-span-2 text-[10px] font-bold text-[#C81E4E] uppercase italic mb-1">Automation Logic</div>
                <div>
                  <label className="block text-[9px] font-black text-pink-700 uppercase mb-1">Trigger</label>
                  <select
                    value={formData.rule_type}
                    onChange={e => setFormData({ ...formData, rule_type: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-pink-200 rounded text-xs"
                  >
                    <option value="manual">Manual</option>
                    <option value="video_completed">Video</option>
                    <option value="task_submitted">Task</option>
                    <option value="quiz_score">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-pink-700 uppercase mb-1">Target</label>
                  <input
                    type="number"
                    value={formData.rule_value}
                    onChange={e => setFormData({ ...formData, rule_value: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-pink-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-16 resize-none"
                  placeholder="How to earn..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-bold uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl font-bold uppercase text-[10px] shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : (editingBadge ? 'Update Rule' : 'Deploy Rule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
