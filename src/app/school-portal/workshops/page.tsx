'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiCalendar,
  FiClock,
  FiVideo,
  FiUsers,
  FiExternalLink,
  FiSearch,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiUser,
  FiLayers,
  FiInfo
} from 'react-icons/fi'

interface Workshop {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  duration_type: string
  duration_badge: string
  start_date?: string
  end_date?: string
  timing: string
  platform: string
  meeting_link: string
  meeting_id?: string
  passcode?: string
  instructor_name?: string
  instructor_role?: string
  status: string
  max_seats?: number
  created_at?: string
}

export default function SchoolWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [schoolName, setSchoolName] = useState('')

  const fetchWorkshops = async () => {
    setLoading(true)
    try {
      const token = await getSchoolClientAuthToken()
      const res = await fetch(`/api/school/workshops?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setWorkshops(data.data || [])
        if (data.school_name) setSchoolName(data.school_name)
      }
    } catch (err) {
      console.error('Fetch workshops error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkshops()
  }, [filter])

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const filteredWorkshops = workshops.filter(w =>
    w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isToday = (dateStr?: string) => {
    if (!dateStr) return false
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/10">
            Training & Capacity Building
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <FiVideo className="text-pink-400" />
            Workshops & Training Sessions
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
            Stay updated with all upcoming live faculty & student development workshops scheduled by the LMS administration.
            Coordinate with your students and ensure active participation.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search workshop title or instructor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'upcoming'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Workshops
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'past'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Archive
          </button>
        </div>
      </div>

      {/* Workshops Grid */}
      {loading ? (
        <div className="p-16 text-center text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          Loading scheduled workshops...
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-xl">
            <FiCalendar />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Workshops Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filter === 'upcoming'
              ? 'There are no upcoming workshops scheduled currently. Please check back soon or review the archive.'
              : 'No workshops match the selected search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkshops.map(workshop => {
            const liveToday = isToday(workshop.start_date)

            return (
              <div
                key={workshop.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-100">
                        <FiLayers className="text-xs" />
                        {workshop.duration_badge || 'Workshop'}
                      </span>

                      {liveToday ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-extrabold uppercase animate-pulse">
                          ● Live Today
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {workshop.platform || 'Online'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900 leading-snug line-clamp-2">
                      {workshop.title}
                    </h3>

                    {workshop.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {workshop.description}
                      </p>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="px-5 py-3 bg-gray-50/70 border-y border-gray-100 space-y-2">
                    {/* Date */}
                    <div className="flex items-center gap-2.5 text-xs text-gray-700">
                      <FiCalendar className="text-purple-600 shrink-0 text-sm" />
                      <div>
                        <span className="font-bold text-gray-900">
                          {workshop.start_date
                            ? new Date(workshop.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Date TBA'}
                        </span>
                        {workshop.end_date && workshop.end_date !== workshop.start_date && (
                          <span className="text-gray-500">
                            {' '}
                            to{' '}
                            {new Date(workshop.end_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timing */}
                    {workshop.timing && (
                      <div className="flex items-center gap-2.5 text-xs text-gray-700">
                        <FiClock className="text-pink-600 shrink-0 text-sm" />
                        <span className="font-semibold text-gray-800">{workshop.timing}</span>
                      </div>
                    )}

                    {/* Instructor */}
                    {workshop.instructor_name && (
                      <div className="flex items-center gap-2.5 text-xs text-gray-700">
                        <FiUser className="text-teal-600 shrink-0 text-sm" />
                        <div>
                          <span className="font-bold text-gray-900">{workshop.instructor_name}</span>
                          {workshop.instructor_role && (
                            <span className="text-gray-500 text-[11px]"> ({workshop.instructor_role})</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white flex items-center justify-between gap-2">
                  {workshop.meeting_link ? (
                    <>
                      <a
                        href={workshop.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <FiExternalLink /> Join Session
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(workshop.meeting_link, workshop.id)}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Copy Link to share with students"
                      >
                        {copiedId === workshop.id ? (
                          <FiCheck className="text-green-600 text-sm" />
                        ) : (
                          <FiCopy className="text-sm" />
                        )}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium italic">Link will be shared soon</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
