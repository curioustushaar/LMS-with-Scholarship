'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, Calendar, ArrowRight, DollarSign } from 'lucide-react'

interface InternshipItem {
  id: string | number
  role_title?: string
  role?: string
  company_name?: string
  company?: string
  work_type?: string
  type?: string
  duration?: string
  stipend?: string
  location?: string
  logoBg?: string
  badgeBg?: string
}

const defaultInternships: InternshipItem[] = [
  {
    id: 1,
    role: 'Frontend Developer',
    company: 'TechVerve Solutions',
    type: 'Remote',
    duration: '6 Months',
    stipend: '₹15,000 / month',
    logoBg: 'bg-pink-50 text-[#FF2D8D]',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    id: 2,
    role: 'UI/UX Design Intern',
    company: 'Creative Minds',
    type: 'Hybrid',
    duration: '3 Months',
    stipend: '₹12,000 / month',
    logoBg: 'bg-purple-50 text-[#9C27FF]',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    id: 3,
    role: 'Data Analyst Intern',
    company: 'DataWave Analytics',
    type: 'Remote',
    duration: '6 Months',
    stipend: '₹18,000 / month',
    logoBg: 'bg-blue-50 text-blue-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
]

export default function Internships() {
  const [internships, setInternships] = useState<InternshipItem[]>(defaultInternships)

  useEffect(() => {
    fetch('/api/public/internships?limit=3')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((item: any, idx: number) => ({
            id: item.id,
            role: item.role_title,
            company: item.company_name,
            type: item.work_type ? item.work_type.charAt(0).toUpperCase() + item.work_type.slice(1) : 'Remote',
            duration: item.duration || '6 Months',
            stipend: item.stipend || '₹15,000 / month',
            logoBg: idx % 3 === 0 ? 'bg-pink-50 text-[#FF2D8D]' : idx % 3 === 1 ? 'bg-purple-50 text-[#9C27FF]' : 'bg-blue-50 text-blue-600',
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          }))
          setInternships(mapped)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section id="internships" className="relative py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#9C27FF] uppercase tracking-[0.2em] block mb-2">
              Career Openings
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
              Latest <span className="text-gradient">Internships</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              Kickstart your career with real-world industry experience under top tech employers.
            </p>
          </div>
          <Link href="/internships">
            <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
              View All Internships
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internships.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Card Top: Icon & Type Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${internship.logoBg}`}>
                    <Briefcase size={22} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${internship.badgeBg}`}>
                    {internship.type}
                  </span>
                </div>

                {/* Role & Company */}
                <div>
                  <h3 className="font-heading font-extrabold text-base text-gray-900 leading-snug">
                    {internship.role}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    {internship.company}
                  </p>
                </div>

                {/* Meta Attributes */}
                <div className="space-y-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-800">{internship.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stipend:</span>
                    <span className="font-bold text-[#FF2D8D]">{internship.stipend}</span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link href="/internships" className="block w-full">
                  <button className="w-full py-2.5 bg-gray-50 hover:bg-gradient-to-r hover:from-[#FF2D8D] hover:to-[#9C27FF] hover:text-white text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                    Apply Now
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
