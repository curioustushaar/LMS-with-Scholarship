'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Users, Briefcase, ArrowRight, CheckCircle2, Star, ShieldCheck } from 'lucide-react'

interface Employer {
  id: string
  company_name: string
  industry?: string
  description?: string
  location?: string
  partnership_type: string
  is_featured: boolean
}

export default function Employers() {
  const [employers, setEmployers] = useState<Employer[]>([])

  useEffect(() => {
    fetch('/api/public/employers?featured=true&limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setEmployers(data.data)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section id="employers" className="relative py-24 bg-white overflow-hidden border-t border-gray-50">
      {/* Soft Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-[#9C27FF]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#9C27FF] uppercase tracking-[0.2em] block mb-2">
              Corporate Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
              Top <span className="text-gradient">Hiring Employers</span> & Industry Partners
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              Our students get hired by leading tech enterprises, high-growth startups, and consulting firms across India.
            </p>
          </div>
          <Link href="/employers">
            <button className="px-5 py-2.5 border border-[#9C27FF]/30 hover:border-[#9C27FF] text-[#9C27FF] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              View Employer Directory
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Employer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employers.map((emp, idx) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#9C27FF] flex items-center justify-center font-extrabold text-lg">
                    <Building2 size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {emp.industry || 'Tech'}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-lg">{emp.company_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{emp.location || 'Pan India'}</p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{emp.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Hiring Domain</span>
                <span className="font-bold text-gray-800 capitalize">{emp.partnership_type} Partner</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Employer Callout Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <h4 className="text-xl font-heading font-bold">Are you an Employer looking for Top Tech Talent?</h4>
            <p className="text-xs text-gray-300 max-w-xl">
              Post your job openings, conduct campus recruitment drives, and hire pre-vetted students with verified portfolios.
            </p>
          </div>
          <Link href="/employers">
            <button className="px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-full shadow-lg hover:shadow-pink-500/25 transition-all whitespace-nowrap">
              Hire from AAGAJ
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
