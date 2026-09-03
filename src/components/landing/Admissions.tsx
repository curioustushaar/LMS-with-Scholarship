'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, Calendar, Clock, ArrowRight, CheckCircle2, Award, Users } from 'lucide-react'

interface AdmissionProgram {
  id: string
  program_name: string
  description?: string
  eligibility?: string
  duration?: string
  fee_structure?: string
  seats_available: number
  status: string
}

export default function Admissions() {
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])

  useEffect(() => {
    fetch('/api/public/admissions?limit=3')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPrograms(data.data)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section id="admissions" className="relative py-24 bg-white overflow-hidden border-t border-gray-50">
      {/* Background Soft Blobs */}
      <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-[#FF2D8D]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-[#9C27FF]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-2">
              Academic Enrollments
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
              Admissions & <span className="text-gradient">Intake Programs</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              Join our flagship technical programs with verified placement tracks, flexible fee structures, and scholarship grants.
            </p>
          </div>
          <Link href="/admissions">
            <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              View All Programs
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Programs Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog, idx) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    ● Admissions Open
                  </span>
                  <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                    <Users size={12} /> {prog.seats_available} seats
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-lg group-hover:text-[#FF2D8D] transition-colors leading-snug">
                    {prog.program_name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{prog.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-800">{prog.duration || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eligibility:</span>
                    <span className="font-semibold text-gray-800">{prog.eligibility || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="font-bold text-[#FF2D8D]">{prog.fee_structure || 'Free'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-50">
                <Link href="/admissions" className="block w-full">
                  <button className="w-full py-2.5 bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-[#FF2D8D] group-hover:to-[#9C27FF] group-hover:text-white text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                    Apply for Admission
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
