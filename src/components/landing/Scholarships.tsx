'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Calendar,
  MapPin,
  ShieldCheck,
  Trophy,
  Check,
  Clock,
  BookOpen,
  BadgeCheck,
} from 'lucide-react'

interface ScholarshipScheme {
  id: string
  title: string
  category: string
  description?: string
  eligibility_criteria?: string
  min_percentage?: number
  eligible_qualifications?: string[]
  application_fee: number
  scholarship_value: string
  reward_type?: string
  reward_details?: {
    waiver_percentage?: number
    cash_amount?: number
    perks?: string[]
  }
  prize_distribution?: {
    first_prize?: string
    second_prize?: string
    third_prize?: string
    consolation?: string
  }
  exam_date?: string
  exam_time?: string
  exam_mode?: string
  status?: string
}

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<ScholarshipScheme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/scholarships?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setScholarships(data.data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="scholarships" className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-pink-50/20 to-purple-50/20 overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-100/80 text-[#FF2D8D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              National Financial Aid & Merit Grants
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
              Available <span className="text-gradient">Scholarships & Awards</span>
            </h2>
            <p className="text-xs sm:text-base text-gray-600 mt-2 max-w-xl leading-relaxed">
              Empowering talented school and college scholars across India with direct cash prizes, full tuition fee waivers, and recognized mentorship.
            </p>
          </div>

          <Link href="/scholarships">
            <button className="px-6 py-3 border-2 border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] hover:bg-[#FF2D8D] hover:text-white text-xs sm:text-sm font-extrabold rounded-2xl bg-white transition-all shadow-sm hover:shadow-pink-500/20 flex items-center gap-2 self-start md:self-auto group">
              View All Schemes & Merit Lists
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>

        {/* Scholarships Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : scholarships.length === 1 ? (
          /* SINGLE SCHEME: FEATURED SPOTLIGHT SHOWCASE CARD */
          (() => {
            const scheme = scholarships[0]
            const quals = scheme.eligible_qualifications && scheme.eligible_qualifications.length > 0
              ? scheme.eligible_qualifications.join(', ')
              : 'Class 6th to 12th & Undergraduates'

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl border border-pink-100 shadow-xl shadow-purple-500/5 overflow-hidden transition-all hover:border-pink-300"
              >
                {/* Top Accent Ribbon */}
                <div className="bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-indigo-600 px-6 py-3 text-white flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-300" />
                    <span>Official National Merit Showcase &bull; 2026 Batch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-pink-100">Live Intake &bull; Apply Online / Through School</span>
                  </div>
                </div>

                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left 7 Columns: Scheme Info, Specs Grid & Badges */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-pink-50 text-[#FF2D8D] border border-pink-200 text-xs font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <Award size={13} />
                          {scheme.category || 'National Merit'} Scheme
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-extrabold rounded-full">
                          🏆 {scheme.scholarship_value || 'Up to ₹50,000 Cash Grants'}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-gray-900 leading-tight">
                        {scheme.title}
                      </h3>

                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        National competitive talent search assessing academic foundation, analytical aptitude, and subject mastery with verified provincial admit cards and transparent merit rewards.
                      </p>
                    </div>

                    {/* 4-Specs Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <GraduationCap size={12} className="text-purple-600" /> Target Standard
                        </div>
                        <div className="text-xs font-black text-gray-900 truncate" title={quals}>
                          {quals}
                        </div>
                      </div>

                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <Trophy size={12} className="text-[#FF2D8D]" /> Reward Grant
                        </div>
                        <div className="text-xs font-black text-[#FF2D8D] truncate">
                          {scheme.scholarship_value || 'Up to ₹50,000'}
                        </div>
                      </div>

                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <MapPin size={12} className="text-blue-600" /> Exam Venue
                        </div>
                        <div className="text-xs font-black text-gray-900 truncate">
                          {scheme.exam_mode || 'Center / District OMR'}
                        </div>
                      </div>

                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                          <BadgeCheck size={12} className="text-emerald-600" /> Intake Fee
                        </div>
                        <div className="text-xs font-black text-emerald-700">
                          {scheme.application_fee === 0 ? 'Free (₹0)' : `₹${scheme.application_fee} (Nominal)`}
                        </div>
                      </div>
                    </div>

                    {/* Verified Highlights Chips */}
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold">
                        <CheckCircle2 size={13} className="text-emerald-600" /> Direct Bank Cash Transfer
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 rounded-xl border border-purple-200 font-semibold">
                        <CheckCircle2 size={13} className="text-purple-600" /> District-Wise Center Allocation
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 font-semibold">
                        <CheckCircle2 size={13} className="text-blue-600" /> Certificate of Merit & Trophy
                      </span>
                    </div>
                  </div>

                  {/* Right 5 Columns: Podium Prize Box & Interactive Apply CTA */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-purple-50 via-pink-50/50 to-white rounded-3xl p-6 sm:p-7 border border-purple-100/80 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                      <div>
                        <div className="text-xs font-extrabold text-purple-950 uppercase tracking-wide">
                          Prize & Award Distribution
                        </div>
                        <div className="text-[11px] text-purple-600">Disbursed on official results declaration</div>
                      </div>
                      <span className="text-2xl">🎖️</span>
                    </div>

                    {/* Podium Prizes List */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                            1st
                          </span>
                          <span className="text-xs font-bold text-gray-800">State / National Rank 1</span>
                        </div>
                        <span className="font-extrabold text-amber-700 text-xs">
                          {scheme.prize_distribution?.first_prize || '₹50,000 + Gold Medal & Trophy'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-black text-xs flex items-center justify-center">
                            2nd
                          </span>
                          <span className="text-xs font-bold text-gray-800">Rank 2 & Runners Up</span>
                        </div>
                        <span className="font-extrabold text-purple-700 text-xs">
                          {scheme.prize_distribution?.second_prize || '₹25,000 + Silver Medal'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-100 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center">
                            3rd
                          </span>
                          <span className="text-xs font-bold text-gray-800">Rank 3 & Top Scorers</span>
                        </div>
                        <span className="font-extrabold text-orange-700 text-xs">
                          {scheme.prize_distribution?.third_prize || '₹10,000 + Bronze Medal'}
                        </span>
                      </div>
                    </div>

                    {/* Apply Call To Action */}
                    <div className="space-y-2.5 pt-2">
                      <Link href="/scholarships" className="block w-full">
                        <button className="w-full py-3.5 px-6 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] hover:from-[#e0267b] hover:to-[#881ee0] text-white font-black text-sm rounded-2xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 group">
                          <span>Apply & Register Candidate</span>
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </Link>

                      <p className="text-[11px] text-center text-gray-500">
                        Instant Registration Code &bull; Photo Upload &bull; Provisional Admit Card
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()
        ) : (
          /* MULTIPLE SCHEMES: MODERN RESPONSIVE GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {scholarships.map((scheme, index) => {
              const quals = scheme.eligible_qualifications && scheme.eligible_qualifications.length > 0
                ? scheme.eligible_qualifications.slice(0, 3).join(', ') + (scheme.eligible_qualifications.length > 3 ? '...' : '')
                : 'All Eligible Standards'

              return (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 hover:border-[#FF2D8D]/50 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 relative group"
                >
                  <div className="space-y-4">
                    {/* Header Pill & Reward Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-pink-50 text-[#FF2D8D] border border-pink-100 uppercase tracking-wider">
                        {scheme.category || 'Merit'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-xs">
                        {scheme.scholarship_value || 'Up to ₹50k'}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-heading font-extrabold text-gray-900 group-hover:text-[#FF2D8D] transition-colors leading-snug">
                        {scheme.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {scheme.description || 'Comprehensive merit scholarship granting financial awards and recognized certification.'}
                      </p>
                    </div>

                    {/* Feature Specification Badges */}
                    <div className="space-y-2 pt-1 border-t border-gray-100 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <GraduationCap size={13} className="text-purple-600" /> Eligibility:
                        </span>
                        <span className="font-bold text-gray-900 truncate max-w-[160px]">{quals}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={13} className="text-blue-600" /> Mode:
                        </span>
                        <span className="font-bold text-gray-900">{scheme.exam_mode || 'Center Based OMR'}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <BadgeCheck size={13} className="text-emerald-600" /> Intake Fee:
                        </span>
                        <span className="font-bold text-emerald-700">
                          {scheme.application_fee === 0 ? 'Free' : `₹${scheme.application_fee}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <Link href="/scholarships" className="block w-full">
                      <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gradient-to-r hover:from-[#FF2D8D] hover:to-[#9C27FF] hover:text-white text-gray-900 text-xs font-extrabold rounded-2xl border border-gray-200 hover:border-transparent transition-all shadow-xs flex items-center justify-center gap-2 group-hover:shadow-md">
                        <span>Check Eligibility & Apply</span>
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Bottom Trust & Assurance Ribbon */}
        <div className="mt-12 sm:mt-16 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-around gap-4 text-center md:text-left text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
            <span>100% Transparent State & National Merit Ranks</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2.5">
            <Trophy size={20} className="text-amber-500 shrink-0" />
            <span>Direct Cash Prize & Tuition Grant Disbursement</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2.5">
            <MapPin size={20} className="text-purple-600 shrink-0" />
            <span>Physical Examination Center Allocation Across Districts</span>
          </div>
        </div>
      </div>
    </section>
  )
}
