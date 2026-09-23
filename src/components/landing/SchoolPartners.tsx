'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  School,
  GraduationCap,
  MapPin,
  Users,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Building2
} from 'lucide-react'

interface SchoolPartner {
  id: string
  school_id?: string
  institution_name: string
  institution_type: 'school' | 'coaching' | string
  board?: string
  school_type?: string
  description?: string
  location?: string
  city?: string
  state?: string
  students_enrolled?: number
}

export default function SchoolPartners() {
  const [partners, setPartners] = useState<SchoolPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'school' | 'coaching'>('all')

  useEffect(() => {
    fetch('/api/public/school-partners?limit=20')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data)) {
          setPartners(data.data)
        }
      })
      .catch((err) => console.error('Error fetching landing school partners:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredPartners = partners.filter((p) => {
    if (activeTab === 'all') return true
    return p.institution_type === activeTab
  })

  const schoolCount = partners.filter((p) => p.institution_type === 'school').length
  const coachingCount = partners.filter((p) => p.institution_type === 'coaching').length

  return (
    <section id="school-partners" className="relative py-28 bg-gradient-to-b from-white via-[#faf5ff]/40 to-white overflow-hidden border-t border-purple-50">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400/10 to-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-gradient-to-tl from-amber-400/10 to-pink-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header & Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-50 via-purple-50 to-amber-50 border border-pink-100/80 shadow-xs mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2D8D] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] bg-clip-text text-transparent">
                Accredited Institutional Alliances
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-gray-900 tracking-tight leading-tight">
              School & <span className="bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-[#FF7B00] bg-clip-text text-transparent">Coaching Partners</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 font-normal leading-relaxed">
              Partnering with top premier schools, coaching academies, and foundation institutes to provide authorized scholarship schemes, fee incentives, and nationwide talent access.
            </p>
          </div>

          {/* Action Links & Partner Login Button */}
          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            <Link href="/school-portal/login">
              <button className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-[#FF2D8D] hover:to-[#9C27FF] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-pink-500/20 flex items-center gap-2 group cursor-pointer">
                <Building2 size={14} className="group-hover:rotate-6 transition-transform" />
                Partner Portal Login
              </button>
            </Link>

            <Link href="/school-partners">
              <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] hover:bg-pink-50/50 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 group cursor-pointer">
                Explore All Alliances
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs Navigation */}
        <div className="flex items-center justify-start sm:justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl border border-gray-200/70 shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'text-white shadow-md shadow-[#FF2D8D]/25'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'all' && (
                <motion.div
                  layoutId="activePartnerTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Award size={14} /> All Alliances
                <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">
                  {partners.length}
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('school')}
              className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'school'
                  ? 'text-white shadow-md shadow-purple-500/25'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'school' && (
                <motion.div
                  layoutId="activePartnerTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#9C27FF] to-[#6366F1] rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <School size={14} /> Partner Schools
                <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">
                  {schoolCount}
                </span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('coaching')}
              className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'coaching'
                  ? 'text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'coaching' && (
                <motion.div
                  layoutId="activePartnerTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF7B00] to-[#FF2D8D] rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <GraduationCap size={14} /> Coaching Centers
                <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">
                  {coachingCount}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white/80 backdrop-blur rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                  <div className="w-24 h-5 rounded-full bg-gray-200" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-16 bg-gray-50 rounded-2xl" />
                <div className="h-4 bg-gray-100 rounded w-full pt-2" />
              </div>
            ))}
          </div>
        ) : filteredPartners.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-purple-100/70 max-w-xl mx-auto shadow-xl shadow-purple-500/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {activeTab === 'coaching' ? 'No Coaching Centers Listed Yet' : 'No Partners Found'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
              New institutional partners and authorized coaching academies are currently being onboarded.
            </p>
            <Link href="/school-portal/login">
              <button className="px-5 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                Register as Institutional Partner
              </button>
            </Link>
          </motion.div>
        ) : (
          /* Cards Grid */
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredPartners.map((p, idx) => {
                const isCoaching = p.institution_type === 'coaching'

                return (
                  <motion.div
                    key={p.id || p.school_id || idx}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="relative group bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Glowing Gradient Border on Hover */}
                    <div className={`absolute inset-0 rounded-3xl p-[1.5px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${
                      isCoaching 
                        ? 'from-[#FF7B00] via-[#FF2D8D] to-[#9C27FF]' 
                        : 'from-[#9C27FF] via-[#FF2D8D] to-[#3B82F6]'
                    }`} style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />

                    {/* Top Ambient Glow */}
                    <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${
                      isCoaching ? 'bg-amber-400' : 'bg-pink-400'
                    }`} />

                    <div className="relative z-10 space-y-4">
                      {/* Top Header: Icon + Partner Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm ${
                            isCoaching
                              ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/20 text-[#FF7B00] border border-orange-200/50'
                              : 'bg-gradient-to-br from-pink-500/10 to-purple-500/20 text-[#FF2D8D] border border-pink-200/50'
                          }`}
                        >
                          {isCoaching ? <GraduationCap size={26} /> : <School size={26} />}
                        </div>

                        {/* Partner Category Badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1.5 ${
                              isCoaching
                                ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200/80'
                                : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200/80'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isCoaching ? 'bg-orange-500' : 'bg-purple-500'}`} />
                            {isCoaching ? '🎓 Coaching Institute' : '🏫 School Partner'}
                          </span>

                          {p.board && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono">
                              {p.board}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 className="font-heading font-black text-gray-900 text-base leading-snug group-hover:text-[#FF2D8D] transition-colors line-clamp-2">
                          {p.institution_name}
                        </h3>

                        <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1 mt-1.5">
                          <MapPin size={12} className={isCoaching ? 'text-amber-500 shrink-0' : 'text-[#FF2D8D] shrink-0'} />
                          <span className="truncate">{p.location || 'India'}</span>
                        </p>
                      </div>

                      {/* Description / Specialization */}
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-normal bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/80">
                        {p.description}
                      </p>
                    </div>

                    {/* Footer Stats & Status */}
                    <div className="relative z-10 pt-4 mt-4 border-t border-gray-100/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                        <span className="font-bold text-emerald-700 text-[11px] tracking-wide flex items-center gap-0.5">
                          <ShieldCheck size={12} /> Authorized Tie-up
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Accredited
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}
