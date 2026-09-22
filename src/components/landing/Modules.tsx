'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, BookOpen, Briefcase, GraduationCap, Building2, BarChart2, School, Sparkles, CheckCircle2 } from 'lucide-react'

const modulesData = [
  {
    title: 'Learning Management',
    desc: 'Create, deliver, and track interactive courses, assignments, and verified certificates seamlessly.',
    icon: BookOpen,
    href: '#courses',
    badge: 'Core LMS',
    color: 'from-[#FF2D8D] to-[#9C27FF]',
    iconBg: 'bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF]',
    textColor: 'text-[#9C27FF]',
    borderColor: 'hover:border-pink-200',
    shadowColor: 'hover:shadow-pink-500/10',
    illustration: (
      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/70 border border-pink-100/60 p-3">
        <div className="w-full max-w-[150px] bg-white rounded-xl shadow-xs border border-pink-100/60 p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-1.5 bg-pink-500/80 rounded-full" />
            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">94%</span>
          </div>
          <div className="w-full h-1 bg-purple-100 rounded-full" />
          <div className="w-3/4 h-1 bg-gray-100 rounded-full" />
        </div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-white shadow-md border border-pink-100 flex items-center justify-center text-xs"
        >
          🎓
        </motion.div>
      </div>
    )
  },
  {
    title: 'Scholarship Management',
    desc: 'Automated scholarship applications, center allocation, physical admit cards, and merit awards.',
    icon: GraduationCap,
    href: '#scholarships',
    badge: 'National Board',
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    textColor: 'text-amber-600',
    borderColor: 'hover:border-amber-200',
    shadowColor: 'hover:shadow-amber-500/10',
    illustration: (
      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/70 border border-amber-100/60 p-3">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-amber-200/80 flex items-center justify-center text-2xl">
          🏆
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-4 top-3 text-xs"
        >
          ✨
        </motion.div>
        <span className="absolute left-3 bottom-2 text-[8px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
          100% Merit Waiver
        </span>
      </div>
    )
  },
  {
    title: 'Internship & Career Hub',
    desc: 'Discover verified industrial internships, live industry capstone projects, and direct hiring tracks.',
    icon: Briefcase,
    href: '#internships',
    badge: 'Placement Track',
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    textColor: 'text-blue-600',
    borderColor: 'hover:border-blue-200',
    shadowColor: 'hover:shadow-blue-500/10',
    illustration: (
      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/70 border border-blue-100/60 p-3">
        <div className="w-full max-w-[150px] bg-white rounded-xl shadow-xs border border-blue-100 p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-blue-700">Interview Call</span>
            <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">Shortlisted</span>
          </div>
          <div className="w-full py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[7px] text-center font-extrabold shadow-xs">
            Accept Offer Letter
          </div>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute left-3 top-2 w-7 h-7 rounded-lg bg-white shadow-md border border-blue-100 flex items-center justify-center text-xs"
        >
          💼
        </motion.div>
      </div>
    )
  },
  {
    title: 'School & Partner Tie-ups',
    desc: 'Dedicated school dashboards for bulk student registrations, center management, and incentive tracking.',
    icon: School,
    href: '#school-partners',
    badge: 'Institution Portal',
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    textColor: 'text-emerald-600',
    borderColor: 'hover:border-emerald-200',
    shadowColor: 'hover:shadow-emerald-500/10',
    illustration: (
      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/70 border border-emerald-100/60 p-3">
        <div className="w-full max-w-[150px] bg-white rounded-xl shadow-xs border border-emerald-100 p-2 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
              🏫
            </div>
            <div className="flex-1 min-w-0">
              <div className="w-14 h-1.5 bg-gray-800 rounded" />
              <div className="w-9 h-1 bg-gray-200 rounded mt-0.5" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[7px] font-bold pt-0.5 border-t border-gray-50">
            <span className="text-gray-500">Bulk Verified:</span>
            <span className="text-emerald-700 font-extrabold">250+ Students</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Employer Hiring Portal',
    desc: 'Connect with top percentile performers, pre-screened talent rosters, and conduct live recruitments.',
    icon: Building2,
    href: '#employers',
    badge: 'Talent Pool',
    color: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    textColor: 'text-cyan-600',
    borderColor: 'hover:border-cyan-200',
    shadowColor: 'hover:shadow-cyan-500/10',
    illustration: (
      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50/80 to-blue-50/70 border border-cyan-100/60 p-3">
        <div className="w-full max-w-[150px] bg-white rounded-xl shadow-xs border border-cyan-100 p-2 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center text-xs">
              👨‍💻
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-bold text-gray-900">Senior Rank Holder</div>
              <div className="text-[7px] text-cyan-600 font-semibold">Verified Skills Score: 98%</div>
            </div>
          </div>
          <div className="w-full py-0.5 bg-emerald-50 text-emerald-700 text-[7px] font-extrabold flex items-center justify-center gap-1 rounded-md border border-emerald-200/60">
            <CheckCircle2 size={9} /> Pre-Screened Candidate
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Analytics & Merit Ranks',
    desc: 'Real-time performance analytics, demographic breakdowns, digital result publication, and rank lists.',
    icon: BarChart2,
    href: '#about',
    badge: 'Live Insights',
    color: 'from-purple-500 to-[#FF2D8D]',
    iconBg: 'bg-gradient-to-br from-purple-500 to-[#FF2D8D]',
    textColor: 'text-purple-600',
    borderColor: 'hover:border-purple-200',
    shadowColor: 'hover:shadow-purple-500/10',
    illustration: (
      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/70 border border-purple-100/60 p-3">
        <div className="w-full max-w-[150px] bg-white rounded-xl shadow-xs border border-purple-100 p-2 space-y-1.5">
          <div className="flex justify-between items-center text-[7px] font-extrabold text-gray-500 uppercase">
            <span>District Density</span>
            <span className="text-[#FF2D8D] font-black">+38% YoY</span>
          </div>
          <div className="flex gap-1 items-end h-7 pt-1">
            <div className="flex-1 bg-purple-200 rounded-t-sm h-3" />
            <div className="flex-1 bg-purple-300 rounded-t-sm h-4" />
            <div className="flex-1 bg-purple-400 rounded-t-sm h-5" />
            <div className="flex-1 bg-pink-400 rounded-t-sm h-6" />
            <div className="flex-1 bg-gradient-to-t from-[#FF2D8D] to-[#9C27FF] rounded-t-sm h-7" />
          </div>
        </div>
      </div>
    )
  }
]

export default function Modules() {
  return (
    <section id="about" className="relative py-20 sm:py-28 bg-white overflow-hidden scroll-mt-20">
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-0 w-[400px] h-[400px] rounded-full bg-[#FF2D8D]/3 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* CENTERED HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/80 shadow-xs"
          >
            <Sparkles size={13} className="text-[#FF2D8D]" />
            <span className="text-[11px] sm:text-xs font-black text-[#9C27FF] uppercase tracking-[0.18em]">
              Platform Overview
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-gray-900 tracking-tight leading-[1.15]"
          >
            Our Powerful <span className="bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-indigo-600 bg-clip-text text-transparent">Modules</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed px-2"
          >
            A complete, unified ecosystem engineered to streamline education, scholarship workflows, institutional tie-ups, and career progression.
          </motion.p>
        </div>

        {/* BALANCED RESPONSIVE GRID LAYOUT (Centered Below Header) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          {modulesData.map((mod, index) => {
            const IconComponent = mod.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className={`bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${mod.borderColor} ${mod.shadowColor}`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl ${mod.iconBg} flex items-center justify-center text-white shadow-md shadow-gray-200 group-hover:scale-105 transition-transform`}>
                      <IconComponent size={20} />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 ${mod.textColor}`}>
                      {mod.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-heading font-extrabold text-gray-900 group-hover:text-[#FF2D8D] transition-colors leading-snug">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed font-normal">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                {/* Custom Visual Illustration Box */}
                <div className="my-4">
                  {mod.illustration}
                </div>

                {/* Bottom Action Link */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={mod.href}
                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold ${mod.textColor} group-hover:underline`}
                  >
                    <span>Explore Module</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>

                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Operational & Live" />
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
