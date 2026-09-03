'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { Target, Clock, Users, ArrowRight, CheckCircle2, Play, Award, DollarSign, X } from 'lucide-react'

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

export default function TrainingPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProg, setSelectedProg] = useState<TrainingProgram | null>(null)
  const [registeredSuccess, setRegisteredSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/public/training?limit=20')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setPrograms(data.data)
        } else {
          setPrograms([
            {
              id: '1',
              title: 'React 19, Next.js App Router & Server Actions Masterclass',
              program_type: 'Bootcamp',
              duration: '8 Weeks',
              mode: 'online',
              fee: '₹8,999',
              trainer_name: 'Rahul Verma (Principal Architect)',
              description: 'Live hands-on cohort building fullstack SaaS applications with Supabase auth, real-time channels, and CI/CD pipelines.',
              status: 'active',
            },
            {
              id: '2',
              title: 'AWS Cloud Solutions Architect Certification Intensive',
              program_type: 'Certification',
              duration: '4 Weeks',
              mode: 'online',
              fee: '₹6,499',
              trainer_name: 'Priya Sharma (AWS Certified Solutions Architect)',
              description: 'Comprehensive exam bootcamp with hands-on console labs, infrastructure as code simulations, and practice exams.',
              status: 'active',
            },
            {
              id: '3',
              title: 'Digital Growth Strategy & AI Marketing Workshop',
              program_type: 'Workshop',
              duration: '2 Days (Weekend)',
              mode: 'hybrid',
              fee: '₹2,999',
              trainer_name: 'Ankit Gupta (Growth Director)',
              description: 'Accelerate acquisition and retention using analytics pipelines, AI content generation, and programmatic campaign workflows.',
              status: 'active',
            },
          ])
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-purple-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#9C27FF] uppercase tracking-widest px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
            Professional Upskilling Cohorts
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            Corporate & <span className="text-gradient">Executive Training</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Fast-track your technology expertise with weekend workshops, immersive bootcamps, and certification cohorts mentored by practicing leads.
          </p>
        </div>
      </section>

      {/* Training Programs Grid */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading training programs...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        {prog.program_type} • {prog.mode}
                      </span>
                      <span className="text-xs text-emerald-600 font-bold uppercase">● Open</span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-xl group-hover:text-[#9C27FF] transition-colors leading-snug">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold mt-1">Mentor: {prog.trainer_name || 'Industry Lead'}</p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{prog.description}</p>

                    <div className="space-y-2 pt-4 border-t border-gray-50 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold text-gray-800">{prog.duration || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cohort Delivery:</span>
                        <span className="font-semibold text-gray-800 capitalize">{prog.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Enrollment Fee:</span>
                        <span className="font-bold text-[#9C27FF]">{prog.fee || 'Free'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-50">
                    <button
                      onClick={() => {
                        setSelectedProg(prog)
                        setRegisteredSuccess(false)
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Enroll in Cohort
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedProg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-4 relative">
            <button
              onClick={() => setSelectedProg(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#9C27FF] uppercase tracking-widest">Cohort Registration</span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mt-1">{selectedProg.title}</h3>
              <p className="text-xs text-[#9C27FF] font-bold mt-0.5">{selectedProg.fee}</p>
            </div>

            {registeredSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Seat Reserved!</h4>
                <p className="text-xs text-emerald-700">We have emailed you the cohort syllabus and orientation schedule link.</p>
                <button
                  onClick={() => setSelectedProg(null)}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setRegisteredSuccess(true)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aanya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work / Student Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aanya@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirm Registration
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
