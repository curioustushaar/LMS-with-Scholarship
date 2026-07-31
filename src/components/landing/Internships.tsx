'use client'

import { motion } from 'framer-motion'
import { Briefcase, MapPin, Calendar, ArrowRight } from 'lucide-react'

const internshipsData = [
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
          <button className="px-5 py-2.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] text-xs font-bold rounded-full bg-white transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto group">
            View All Internships
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Internships List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internshipsData.map((internship, index) => (
            <motion.div
              key={internship.id}
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
              {/* Header: Logo initials & Role info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* Logo wrapper */}
                    <div className={`w-9 h-9 rounded-xl ${internship.logoBg} flex items-center justify-center font-heading font-extrabold text-base shadow-sm shrink-0`}>
                      {internship.company.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-heading font-extrabold text-gray-900 truncate leading-snug">
                        {internship.role}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                        {internship.company}
                      </span>
                    </div>
                  </div>
                  {/* Job Type Badge */}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${internship.badgeBg}`}>
                    {internship.type}
                  </span>
                </div>

                {/* Details Panel */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    India (Remote)
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {internship.duration}
                  </span>
                </div>
              </div>

              {/* Stipend and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 leading-none">Stipend</span>
                  <span className="text-xs font-bold text-gray-900 mt-1">{internship.stipend}</span>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold text-[10px] rounded-full shadow-sm hover:shadow-md transition-all">
                  Apply Now
                </button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
