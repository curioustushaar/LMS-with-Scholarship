'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Award, Landmark, ArrowRight } from 'lucide-react'

interface ScholarshipItem {
  id: string | number
  title: string
  desc: string
  value: string
  color: string
  bgColor: string
  borderColor: string
}

const defaultScholarships: ScholarshipItem[] = [
  {
    id: 1,
    title: 'AAGAJ Excellence Scholarship',
    desc: 'For students with outstanding academic records and test scores.',
    value: 'Up to 50% waiver',
    color: 'text-[#FF2D8D]',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-100/50',
  },
  {
    id: 2,
    title: 'Leadership Scholarship',
    desc: 'For students displaying exemplary leadership qualities in extracurriculars.',
    value: 'Up to 30% waiver',
    color: 'text-[#9C27FF]',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100/50',
  },
  {
    id: 3,
    title: 'Need Based Scholarship',
    desc: 'Financial support schemes designed for deserving candidates from weaker sections.',
    value: 'Up to 40% waiver',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100/50',
  },
]

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>(defaultScholarships)

  useEffect(() => {
    fetch('/api/public/scholarships?limit=3')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((item: any, idx: number) => ({
            id: item.id,
            title: item.title,
            desc: item.description || 'Financial aid support scheme for enrolled students.',
            value: item.scholarship_value || 'Up to 50% waiver',
            color: idx % 3 === 0 ? 'text-[#FF2D8D]' : idx % 3 === 1 ? 'text-[#9C27FF]' : 'text-blue-500',
            bgColor: idx % 3 === 0 ? 'bg-pink-50' : idx % 3 === 1 ? 'bg-purple-50' : 'bg-blue-50',
            borderColor: idx % 3 === 0 ? 'border-pink-100/50' : idx % 3 === 1 ? 'border-purple-100/50' : 'border-blue-100/50',
          }))
          setScholarships(mapped)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section id="scholarships" className="relative py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-2">
              Financial Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
              Available <span className="text-gradient">Scholarships</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              We ensure financial constraints never hinder bright students from accessing world-class education.
            </p>
          </div>
          <Link href="/scholarships">
            <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              View All Schemes
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Scholarships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scholarships.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`rounded-2xl p-6 border ${scheme.borderColor} ${scheme.bgColor} transition-all flex flex-col justify-between`}
            >
              <div className="space-y-4">
                
                {/* Icon & Value Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <GraduationCap size={22} className={scheme.color} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold bg-white shadow-sm ${scheme.color}`}>
                    {scheme.value}
                  </span>
                </div>

                {/* Scheme Title & Desc */}
                <div>
                  <h3 className="font-heading font-extrabold text-base text-gray-900 leading-snug">
                    {scheme.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {scheme.desc}
                  </p>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link href="/scholarships" className="block w-full">
                  <button className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl transition-all shadow-sm border border-gray-100 flex items-center justify-center gap-1.5">
                    Check Eligibility
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
