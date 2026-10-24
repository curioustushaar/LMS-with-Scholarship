'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Video,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Copy,
  Check,
  X,
  ExternalLink,
  Search,
} from 'lucide-react'

interface WorkshopItem {
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
  instructor_name?: string
  instructor_role?: string
  max_seats?: number
}

const DEFAULT_WORKSHOPS: WorkshopItem[] = [
  {
    id: 'ws-sample-1',
    title: 'Full Stack Web Development & Next.js 14 Masterclass',
    description: 'Learn modern React, Server Components, API routes, and deploy production-grade full-stack web applications in this comprehensive hands-on workshop.',
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    duration_type: '3_days',
    duration_badge: '3 Days Workshop',
    start_date: 'Upcoming Batch',
    timing: '06:00 PM - 08:30 PM IST',
    platform: 'Google Meet',
    instructor_name: 'Dr. Anand Kumar',
    instructor_role: 'Lead Cloud Architect & Ex-Google',
    max_seats: 150,
  },
  {
    id: 'ws-sample-2',
    title: 'AI & Data Science with Python Bootcamp',
    description: 'Practical training on machine learning algorithms, pandas data analysis, automated data visualization, and generative AI models from scratch.',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    duration_type: '1_week',
    duration_badge: '1 Week Bootcamp',
    start_date: 'Weekend Live',
    timing: '07:00 PM - 09:00 PM IST',
    platform: 'Zoom',
    instructor_name: 'Pooja Hegde',
    instructor_role: 'Senior Data Scientist',
    max_seats: 200,
  },
  {
    id: 'ws-sample-3',
    title: 'UI/UX Design Systems & Figma Masterclass',
    description: 'Master the art of crafting scalable design systems, interactive Figma components, responsive wireframes, and design handoff for developers.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    duration_type: '1_day',
    duration_badge: '1 Day Intensive',
    start_date: 'This Sunday',
    timing: '05:00 PM - 08:00 PM IST',
    platform: 'Google Meet',
    instructor_name: 'Rohan Sharma',
    instructor_role: 'Product Designer',
    max_seats: 80,
  },
]

export default function TrainingPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(DEFAULT_WORKSHOPS)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [course, setCourse] = useState('')
  const [branch, setBranch] = useState('')

  // Unlocked Access State
  const [unlockedData, setUnlockedData] = useState<any>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    fetch('/api/public/trainings?limit=30')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setWorkshops(data.data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = workshops.filter((item) => {
    const matchesType = filterType === 'all' || item.duration_type === filterType
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.instructor_name && item.instructor_name.toLowerCase().includes(q))
    return matchesType && matchesSearch
  })

  const handleOpenRegister = (ws: WorkshopItem) => {
    setSelectedWorkshop(ws)
    setUnlockedData(null)
    setErrorMessage('')
    setName('')
    setEmail('')
    setPhone('')
    setCourse('')
    setBranch('')
    setIsModalOpen(true)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !selectedWorkshop) {
      setErrorMessage('Please fill in all details.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/public/trainings/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshop_id: selectedWorkshop.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          course: course.trim() || undefined,
          branch: branch.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (data.success && data.data?.workshop) {
        setUnlockedData(data.data.workshop)
      } else {
        setErrorMessage(data.error || 'Failed to complete registration.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2200)
  }

  const generateGoogleCalendarUrl = (ws: any) => {
    const title = encodeURIComponent(`Live Workshop: ${ws.title}`)
    const details = encodeURIComponent(`Join Link: ${ws.meeting_link}\nPlatform: ${ws.platform}\nTimings: ${ws.timing}\nOrganized by GRAVITY.`)
    const location = encodeURIComponent(ws.meeting_link)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Hero Banner */}
      <section className="pt-36 pb-16 bg-gradient-to-b from-purple-50/50 via-pink-50/20 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-extrabold text-[#FF2D8D] uppercase tracking-widest px-3.5 py-1.5 bg-pink-50 rounded-full border border-pink-100 inline-block shadow-sm">
            Live Industry Workshops & Masterclasses
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            Learn From Industry Experts. <br className="hidden sm:inline" />
            <span className="text-gradient">Build Production Skills.</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Participate in 1-day, 3-day and 1-week workshops. Get instant Google Meet / Zoom access and hands-on mentorship.
          </p>

          {/* Search Bar & Filter Buttons */}
          <div className="pt-6 max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search workshop topic, mentor or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF] text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {[
                { id: 'all', label: 'All Workshops' },
                { id: '1_day', label: '1 Day Intensive' },
                { id: '3_days', label: '3 Days Workshop' },
                { id: '1_week', label: '1 Week Bootcamp' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterType === tab.id
                      ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No workshops matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ws, idx) => (
                <div
                  key={ws.id}
                  className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100/80 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={ws.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                        alt={ws.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/30" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-gray-900 shadow">
                          {ws.duration_badge}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {ws.platform} Live
                        </span>
                      </div>

                      {ws.instructor_name && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF2D8D] to-[#9C27FF] text-white text-[11px] font-bold flex items-center justify-center shrink-0 border border-white/30">
                            {ws.instructor_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate">{ws.instructor_name}</p>
                            <p className="text-[10px] text-gray-300 truncate">{ws.instructor_role || 'Industry Mentor'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="font-heading font-extrabold text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-[#FF2D8D] transition-colors">
                        {ws.title}
                      </h3>

                      <p className="text-xs text-gray-500 font-normal line-clamp-2 leading-relaxed">
                        {ws.description || 'Hands-on practical training session with industry experts. Live Q&A and project demonstration.'}
                      </p>

                      <div className="pt-3 border-t border-gray-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Clock size={13} className="text-[#FF2D8D]" />
                            Timings:
                          </span>
                          <span className="font-bold text-gray-800 text-[11px]">{ws.timing}</span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Calendar size={13} className="text-[#9C27FF]" />
                            Schedule:
                          </span>
                          <span className="font-semibold text-gray-700 text-[11px]">
                            {ws.start_date || 'Live Batch Open'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleOpenRegister(ws)}
                      className="w-full py-3 bg-gray-50 hover:bg-gradient-to-r hover:from-[#FF2D8D] hover:to-[#9C27FF] hover:text-white text-gray-800 text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                    >
                      <Sparkles size={14} className="text-[#FF2D8D] group-hover/btn:text-white transition" />
                      Join Workshop Free
                      <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && selectedWorkshop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-gray-100 my-auto max-h-[92vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition z-10"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {!unlockedData ? (
                <div className="space-y-5">
                  <div className="pr-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#9C27FF] border border-purple-100 inline-block mb-2">
                      {selectedWorkshop.duration_badge}
                    </span>
                    <h3 className="text-xl font-heading font-extrabold text-gray-900 leading-snug">
                      Join {selectedWorkshop.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your details below to instantly unlock the live {selectedWorkshop.platform} session link and receive your calendar invite.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        WhatsApp / Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        We will send the meeting invite and recording details to this email.
                      </p>
                    </div>

                    {/* Course & Branch Fields (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Course
                          </label>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. B.Tech / BCA / MCA"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Branch
                          </label>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. CSE / IT / Mech / AI"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-extrabold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Securing Your Seat...
                        </span>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          Unlock Live Workshop Link
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6 text-center py-2">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                    <CheckCircle2 size={32} />
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                      Registration Confirmed
                    </span>
                    <h3 className="text-xl font-heading font-extrabold text-gray-900 mt-2">
                      You are in, {name}! 🎉
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Your seat for <strong>{unlockedData.title}</strong> is reserved.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-500">
                      <span>Platform:</span>
                      <span className="font-bold text-gray-900">{unlockedData.platform}</span>
                    </div>
                    {unlockedData.timing && (
                      <div className="flex items-center justify-between text-gray-500">
                        <span>Timings:</span>
                        <span className="font-bold text-[#FF2D8D]">{unlockedData.timing}</span>
                      </div>
                    )}
                    {unlockedData.passcode && (
                      <div className="flex items-center justify-between text-gray-500">
                        <span>Passcode:</span>
                        <span className="font-mono font-bold text-gray-900">{unlockedData.passcode}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href={unlockedData.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-extrabold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Video size={16} />
                      🚀 Join {unlockedData.platform} Meeting Now
                      <ExternalLink size={14} />
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCopyMeetingLink(unlockedData.meeting_link)}
                        className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 bg-white"
                      >
                        {linkCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        {linkCopied ? 'Link Copied!' : 'Copy Link'}
                      </button>

                      <a
                        href={generateGoogleCalendarUrl(unlockedData)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 bg-white"
                      >
                        <Calendar size={14} className="text-[#9C27FF]" />
                        Add to Calendar
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    A copy of these joining credentials has also been emailed to <strong>{email}</strong>.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
