'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { School, GraduationCap, MapPin, Users, ArrowRight, ShieldCheck, Award } from 'lucide-react'

interface SchoolPartner {
  id: string
  school_id?: string
  institution_name: string
  institution_type: string
  board?: string
  school_type?: string
  description?: string
  location?: string
  students_enrolled?: number
}

export default function SchoolPartners() {
  const [partners, setPartners] = useState<SchoolPartner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/school-partners?limit=8')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data)) {
          setPartners(data.data)
        }
      })
      .catch((err) => console.error('Error fetching landing school partners:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="school-partners" className="relative py-24 bg-white overflow-hidden border-t border-gray-50">
      {/* Background Soft Blobs */}
      <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-[#FF2D8D]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-2">
              Academic Alliances
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
              School & <span className="text-gradient">Coaching Partners</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              We collaborate with recognized partner schools, coaching academies, and institutes to deliver accredited scholarship programs and hybrid learning.
            </p>
          </div>
          <Link href="/school-partners">
            <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              Explore All Partners
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-12 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-100 max-w-xl mx-auto">
            <p className="text-xs text-gray-500">New institutional partners will be listed soon.</p>
          </div>
        ) : (
          /* Partners Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partners.map((p, idx) => {
              const isCoaching = p.institution_type === 'coaching'
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                        isCoaching ? 'bg-amber-50 text-amber-600' : 'bg-pink-50 text-[#FF2D8D]'
                      }`}>
                        {isCoaching ? <GraduationCap size={24} /> : <School size={24} />}
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCoaching 
                          ? 'bg-orange-50 text-orange-700 border-orange-200' 
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {isCoaching ? 'Coaching Partner' : 'School Partner'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-base group-hover:text-[#FF2D8D] transition-colors line-clamp-1">
                        {p.institution_name}
                      </h3>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {p.location || 'India'}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={13} /> Active Partner
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
