'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { School, MapPin, Users, ArrowRight, ShieldCheck, Award } from 'lucide-react'

interface SchoolPartner {
  id: string
  institution_name: string
  institution_type: string
  description?: string
  location?: string
  students_enrolled?: number
}

export default function SchoolPartners() {
  const [partners, setPartners] = useState<SchoolPartner[]>([])

  useEffect(() => {
    fetch('/api/public/school-partners?featured=true&limit=4')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPartners(data.data)
        }
      })
      .catch((err) => console.error(err))
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
              School & <span className="text-gradient">Institutional Partners</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              We collaborate with recognized schools, colleges, and state universities to deliver accredited hybrid learning.
            </p>
          </div>
          <Link href="/school-partners">
            <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              Partner with Us
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#FF2D8D] flex items-center justify-center">
                  <School size={24} />
                </div>

                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-base">{p.institution_name}</h3>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {p.location || 'India'}
                  </p>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{p.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-gray-400">Enrolled:</span>
                <span className="font-bold text-emerald-600">{p.students_enrolled || 100}+ students</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
