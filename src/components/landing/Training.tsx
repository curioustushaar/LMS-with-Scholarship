'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Target, Clock, Users, ArrowRight, CheckCircle2, Play, Award } from 'lucide-react'

interface TrainingProgram {
  id: string
  title: string
  program_type: string
  duration?: string
  mode: string
  fee?: string
  trainer_name?: string
  description?: string
  status: string
}

export default function Training() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])

  useEffect(() => {
    fetch('/api/public/training?limit=3')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPrograms(data.data)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section id="training" className="relative py-24 bg-white overflow-hidden border-t border-gray-50">
      {/* Background Soft Blobs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-[#9C27FF]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#9C27FF] uppercase tracking-[0.2em] block mb-2">
              Upskilling Cohorts
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
              Corporate & <span className="text-gradient">Professional Training</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              Master next-gen engineering, cloud architecture, and marketing technologies with certified industry mentors.
            </p>
          </div>
          <Link href="/training">
            <button className="px-5 py-2.5 border border-[#9C27FF]/30 hover:border-[#9C27FF] text-[#9C27FF] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              Explore All Training
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Training Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog, idx) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {prog.program_type} • {prog.mode}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold uppercase">● Open</span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-lg group-hover:text-[#9C27FF] transition-colors leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Instructor: {prog.trainer_name || 'Industry Lead'}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{prog.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-800">{prog.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="font-semibold text-gray-800 capitalize">{prog.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Program Fee:</span>
                    <span className="font-bold text-[#9C27FF]">{prog.fee || 'Free'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-50">
                <Link href="/training" className="block w-full">
                  <button className="w-full py-2.5 bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-[#9C27FF] group-hover:to-[#FF2D8D] group-hover:text-white text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                    Enroll in Cohort
                    <ArrowRight size={13} />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
