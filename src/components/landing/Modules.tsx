'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Briefcase, GraduationCap, Building2, BarChart2 } from 'lucide-react'

const modulesData = [
  {
    title: 'Learning Management',
    desc: 'Create, manage and deliver engaging learning experiences.',
    icon: BookOpen,
    color: 'from-[#FF2D8D] to-[#9C27FF]',
    textColor: 'text-[#9C27FF]',
    shadowColor: 'hover:shadow-[#FF2D8D]/15',
    illustration: (
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100/50">
        <div className="absolute w-12 h-8 bg-white rounded-md shadow-sm border border-gray-100 flex flex-col p-1 gap-0.5">
          <div className="w-full h-1 bg-pink-100 rounded-full" />
          <div className="w-2/3 h-1 bg-purple-100 rounded-full" />
          <div className="w-1/2 h-1 bg-gray-100 rounded-full" />
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-2 top-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-50 flex items-center justify-center"
        >
          <span className="text-[10px]">🎨</span>
        </motion.div>
      </div>
    )
  },
  {
    title: 'Internship Management',
    desc: 'Discover, apply and manage real-world internship opportunities.',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-600',
    shadowColor: 'hover:shadow-blue-500/15',
    illustration: (
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
        <div className="absolute w-14 h-10 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col p-1.5 justify-between">
          <span className="text-[7px] font-bold text-blue-600 leading-none">Match Found!</span>
          <div className="w-full py-0.5 bg-blue-500 text-white rounded text-[5px] text-center font-bold">Accept Offer</div>
        </div>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute left-2 top-2 w-6 h-6 rounded-full bg-white shadow-md border border-gray-50 flex items-center justify-center"
        >
          <span className="text-[8px]">💼</span>
        </motion.div>
      </div>
    )
  },
  {
    title: 'Scholarship Management',
    desc: 'Find and apply for scholarships to achieve your goals.',
    icon: GraduationCap,
    color: 'from-amber-400 to-orange-500',
    textColor: 'text-amber-600',
    shadowColor: 'hover:shadow-amber-500/15',
    illustration: (
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50">
        <div className="absolute w-10 h-10 bg-white rounded-full shadow-md border border-amber-100 flex items-center justify-center">
          <span className="text-xl">🏆</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-3 top-2 text-xs"
        >
          ✨
        </motion.div>
        <div className="absolute left-3 bottom-2 text-xs">⭐</div>
      </div>
    )
  },
  {
    title: 'Employer Management',
    desc: 'Connect with talented students and hire the best.',
    icon: Building2,
    color: 'from-cyan-400 to-blue-500',
    textColor: 'text-cyan-600',
    shadowColor: 'hover:shadow-cyan-500/15',
    illustration: (
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100/50">
        <div className="absolute w-12 h-10 bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyan-100" />
            <div className="w-6 h-1 bg-gray-200 rounded" />
          </div>
          <div className="w-full h-2 bg-emerald-50 text-emerald-600 text-[5px] font-bold flex items-center justify-center rounded">
            Pre-Screened
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Analytics & Reports',
    desc: 'Data-driven insights for better decisions and growth.',
    icon: BarChart2,
    color: 'from-purple-500 to-[#FF2D8D]',
    textColor: 'text-purple-600',
    shadowColor: 'hover:shadow-purple-500/15',
    illustration: (
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/50">
        <div className="absolute w-14 h-10 bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[5px] text-gray-400 font-bold uppercase">
            <span>Growth</span>
            <span className="text-[#FF2D8D]">+24%</span>
          </div>
          <div className="flex gap-0.5 items-end h-5">
            <div className="w-2 h-2 bg-purple-200 rounded-t-sm" />
            <div className="w-2 h-3 bg-purple-300 rounded-t-sm" />
            <div className="w-2 h-4 bg-purple-400 rounded-t-sm" />
            <div className="w-2 h-5 bg-[#FF2D8D] rounded-t-sm" />
          </div>
        </div>
      </div>
    )
  }
]

export default function Modules() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[20%] right-0 w-[450px] h-[450px] rounded-full bg-[#FF2D8D]/3 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 w-[450px] h-[450px] rounded-full bg-[#9C27FF]/3 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-4 space-y-6 lg:pt-6">
            <span className="text-[10px] sm:text-xs font-bold text-[#9C27FF] uppercase tracking-[0.2em] block">
              Platform Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Our Powerful <br />
              <span className="text-gradient">Modules</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-sm font-normal leading-relaxed">
              A complete ecosystem to manage every aspect of education, student workflows, partner programs, and career development.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#FF2D8D] text-white font-semibold text-sm rounded-full shadow-md shadow-[#FF2D8D]/15 hover:bg-[#FF2D8D]/90 transition-all flex items-center gap-2 group"
            >
              View All Modules
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Right Column: Beautiful Gradient Modules List */}
          <div className="lg:col-span-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="flex gap-6 lg:grid lg:grid-cols-3 lg:gap-5 min-w-[750px] lg:min-w-0">
              {modulesData.map((mod, index) => {
                const IconComponent = mod.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -8,
                    }}
                    className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col justify-between h-[300px] transition-shadow duration-300 ${mod.shadowColor}`}
                  >
                    <div className="space-y-4">
                      {/* Icon & Label */}
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-sm`}>
                          <IconComponent size={16} />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${mod.textColor}`}>
                          Active Module
                        </span>
                      </div>

                      {/* Header and Details */}
                      <div>
                        <h3 className="text-sm font-heading font-extrabold text-gray-900 leading-snug">
                          {mod.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                    </div>

                    {/* Custom Mock Illustration */}
                    <div className="mt-4">
                      {mod.illustration}
                    </div>

                  </motion.div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
