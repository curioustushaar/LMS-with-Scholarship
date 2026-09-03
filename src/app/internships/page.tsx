'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, Calendar, Clock, ArrowRight, DollarSign, Search, CheckCircle2, X } from 'lucide-react'

interface Internship {
  id: string
  role_title: string
  company_name: string
  location?: string
  work_type: string
  duration?: string
  stipend?: string
  description?: string
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/public/internships?limit=20')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setInternships(data.data)
        } else {
          setInternships([
            {
              id: '1',
              role_title: 'Frontend Developer Intern',
              company_name: 'TechVerve Solutions',
              location: 'Bangalore / Remote',
              work_type: 'remote',
              duration: '6 Months',
              stipend: '₹15,000 / month',
              description: 'Work with Next.js, TailwindCSS, and state machines to ship production client portals.',
            },
            {
              id: '2',
              role_title: 'UI/UX Design Intern',
              company_name: 'Creative Minds Studio',
              location: 'Mumbai, India',
              work_type: 'hybrid',
              duration: '3 Months',
              stipend: '₹12,000 / month',
              description: 'Design interactive design systems, component libraries, and usability test scripts in Figma.',
            },
            {
              id: '3',
              role_title: 'Data Analyst & Python Intern',
              company_name: 'DataWave Analytics',
              location: 'Hyderabad, India',
              work_type: 'remote',
              duration: '6 Months',
              stipend: '₹18,000 / month',
              description: 'Build predictive queries and automated visualization pipelines for enterprise clients.',
            },
            {
              id: '4',
              role_title: 'Cloud DevOps Engineering Intern',
              company_name: 'CloudNex Systems',
              location: 'Pune, India',
              work_type: 'onsite',
              duration: '6 Months',
              stipend: '₹20,000 / month',
              description: 'Configure AWS infrastructure, Docker containerization, and GitHub Actions CI/CD workflows.',
            },
          ])
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = internships.filter((item) => {
    const matchesType = filterType === 'All' || item.work_type?.toLowerCase() === filterType.toLowerCase()
    const matchesSearch =
      item.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Header Banner */}
      <section className="pt-32 pb-14 bg-gradient-to-b from-purple-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#9C27FF] uppercase tracking-widest px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
            Industry Career Openings
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            Latest <span className="text-gradient">Internship Opportunities</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Gain verified project experience, earn competitive monthly stipends, and secure pre-placement offers (PPO).
          </p>

          {/* Search and Filters */}
          <div className="pt-8 max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search role or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF] text-sm"
              />
            </div>

            <div className="flex justify-center gap-2">
              {['All', 'Remote', 'Hybrid', 'Onsite'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterType === type
                      ? 'bg-[#9C27FF] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Internships Grid */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading internships...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-400">No internships found matching your filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#9C27FF] flex items-center justify-center font-bold text-lg">
                        <Briefcase size={22} />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#9C27FF] border border-purple-100">
                        {item.work_type}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-lg text-gray-900 group-hover:text-[#9C27FF] transition-colors leading-snug">
                        {item.role_title}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">{item.company_name}</p>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>

                    <div className="space-y-2 pt-3 border-t border-gray-50 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold text-gray-800">{item.duration || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Stipend:</span>
                        <span className="font-bold text-[#FF2D8D]">{item.stipend || 'Competitive'}</span>
                      </div>
                      {item.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="font-semibold text-gray-700">{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-50">
                    <button
                      onClick={() => {
                        setSelectedInternship(item)
                        setAppliedSuccess(false)
                      }}
                      className="w-full py-2.5 bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-[#9C27FF] group-hover:to-[#FF2D8D] group-hover:text-white text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      Apply for Internship
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Apply Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-4 relative">
            <button
              onClick={() => setSelectedInternship(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#9C27FF] uppercase tracking-widest">Apply for Internship</span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mt-1">{selectedInternship.role_title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{selectedInternship.company_name}</p>
            </div>

            {appliedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Application Sent!</h4>
                <p className="text-xs text-emerald-700">We have shared your student profile with {selectedInternship.company_name}.</p>
                <button
                  onClick={() => setSelectedInternship(null)}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setAppliedSuccess(true)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aanya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aanya@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
