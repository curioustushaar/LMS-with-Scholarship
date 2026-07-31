'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Award, Landmark, ArrowRight } from 'lucide-react'

const scholarshipsData = [
  {
    id: 1,
    title: 'AAGAJ Excellence Scholarship',
    desc: 'For students with outstanding academic records and test scores.',
    value: 'Up to 50% waiver',
    icon: GraduationCap,
    color: 'text-[#FF2D8D]',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-100/50',
  },
  {
    id: 2,
    title: 'Leadership Scholarship',
    desc: 'For students displaying exemplary leadership qualities in extracurriculars.',
    value: 'Up to 30% waiver',
    icon: Award,
    color: 'text-[#9C27FF]',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100/50',
  },
  {
    id: 3,
    title: 'Need Based Scholarship',
    desc: 'Financial support schemes designed for deserving candidates from weaker sections.',
    value: 'Up to 40% waiver',
    icon: Landmark,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100/50',
  },
]

export default function Scholarships() {
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
              Scholarships & <span className="text-gradient">Grants</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-md font-normal leading-relaxed">
              Scholarship schemes designed to support your education and fund your dream careers.
            </p>
          </div>
          <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
            View All Scholarships
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Scholarships List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scholarshipsData.map((scholarship, index) => {
            const Icon = scholarship.icon
            return (
              <motion.div
                key={scholarship.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -6, 
                  borderColor: 'rgba(255, 45, 141, 0.2)',
                  boxShadow: '0 12px 25px -10px rgba(156, 39, 255, 0.08)'
                }}
                className="bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-[230px]"
              >
                {/* Upper block */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    {/* Icon Circle */}
                    <div className={`w-10 h-10 rounded-2xl ${scholarship.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={scholarship.color} />
                    </div>
                    <h3 className="text-sm font-heading font-extrabold text-gray-900 leading-snug">
                      {scholarship.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {scholarship.desc}
                  </p>
                </div>

                {/* Lower block: Scholarship value and Apply action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 leading-none">Scholarship Value</span>
                    <span className={`text-xs font-extrabold mt-1.5 ${scholarship.color}`}>
                      {scholarship.value}
                    </span>
                  </div>
                  <button className="px-4 py-2 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] font-bold text-[10px] rounded-full transition-all">
                    Apply Now
                  </button>
                </div>

              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
