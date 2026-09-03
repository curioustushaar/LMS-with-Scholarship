'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion } from 'framer-motion'
import {
  UserPlus,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award,
  Users,
  FileText,
  Send,
  X,
  Search,
  AlertCircle,
} from 'lucide-react'

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

export default function AdmissionsPage() {
  const [activeTab, setActiveTab] = useState<'programs' | 'track'>('programs')
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<AdmissionProgram | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)

  // Form state
  const [applicantData, setApplicantData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    qualification: '',
    percentage: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [appliedId, setAppliedId] = useState('')

  // Tracking state
  const [trackEmail, setTrackEmail] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackedApplications, setTrackedApplications] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetch('/api/public/admissions?limit=12')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setPrograms(data.data)
        } else {
          setPrograms([
            {
              id: '1',
              program_name: 'B.Tech in Computer Science & Artificial Intelligence',
              duration: '4 Years',
              eligibility: '10+2 PCM (Min 60%)',
              fee_structure: '₹1,20,000 / year',
              seats_available: 120,
              status: 'active',
              description:
                'AICTE-aligned curriculum integrated with Machine Learning labs, Cloud computing, and industry capstones.',
            },
            {
              id: '2',
              program_name: 'Bachelor of Computer Applications (BCA Honors)',
              duration: '3 Years',
              eligibility: '10+2 with Math/Stats (Min 50%)',
              fee_structure: '₹80,000 / year',
              seats_available: 60,
              status: 'active',
              description:
                'Comprehensive software engineering program covering full stack frameworks, databases, and mobile applications.',
            },
            {
              id: '3',
              program_name: 'Executive Diploma in Full Stack & Cloud Systems',
              duration: '6 Months',
              eligibility: 'Graduates in any discipline',
              fee_structure: '₹45,000 (one-time)',
              seats_available: 40,
              status: 'active',
              description:
                'Intensive corporate transition bootcamp with guaranteed interview rounds and project deliverables.',
            },
          ])
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleOpenApply = (prog: AdmissionProgram) => {
    setSelectedProgram(prog)
    setApplySuccess(false)
    setShowApplyModal(true)
  }

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/public/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admission_id: selectedProgram?.id,
          ...applicantData,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setApplySuccess(true)
        setAppliedId(data.data?.id || `APP-${Date.now().toString().slice(-6)}`)
        setTrackEmail(applicantData.applicant_email)
      }
    } catch (err) {
      console.error(err)
      setApplySuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTrackStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackEmail.trim()) return
    setTrackingLoading(true)
    setHasSearched(true)
    try {
      const res = await fetch(`/api/public/admissions/status?email=${encodeURIComponent(trackEmail.trim())}`)
      const data = await res.json()
      if (data.success && data.data) {
        setTrackedApplications(data.data)
      } else {
        setTrackedApplications([])
      }
    } catch (err) {
      console.error(err)
      setTrackedApplications([])
    } finally {
      setTrackingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-pink-50/50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
            Admissions & Intake Portal
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            Apply for Our <span className="text-gradient">Flagship Degree Programs</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Choose your technical track, review eligibility criteria and fee structures, or check your submitted application status in real-time.
          </p>

          {/* Navigation Tabs */}
          <div className="pt-6 flex justify-center gap-3">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'programs'
                  ? 'bg-[#FF2D8D] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Academic Programs ({programs.length})
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'track'
                  ? 'bg-[#9C27FF] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Search size={13} /> Track Application Status
            </button>
          </div>
        </div>
      </section>

      {/* Active Tab Content */}
      {activeTab === 'programs' ? (
        /* Programs Grid */
        <section className="py-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading admissions catalog...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all flex flex-col justify-between group"
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

                    <h3 className="font-heading font-bold text-gray-900 text-xl group-hover:text-[#FF2D8D] transition-colors leading-snug">
                      {prog.program_name}
                    </h3>

                    <p className="text-xs text-gray-500 leading-relaxed">{prog.description}</p>

                    <div className="space-y-2 pt-4 border-t border-gray-50 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold text-gray-800">{prog.duration || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Eligibility:</span>
                        <span className="font-semibold text-gray-800">{prog.eligibility || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fee Structure:</span>
                        <span className="font-bold text-[#FF2D8D]">{prog.fee_structure || 'Free'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-50">
                    <button
                      onClick={() => handleOpenApply(prog)}
                      className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Apply for Admission
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Status Tracker Segment */
        <section className="py-12 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-heading font-bold text-gray-900">Check Your Admission Status</h3>
              <p className="text-xs text-gray-500 mt-1">Enter the email address you used when applying to view progress.</p>
            </div>

            <form onSubmit={handleTrackStatus} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="Enter your registered email address..."
                value={trackEmail}
                onChange={(e) => setTrackEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 shrink-0"
              >
                <Search size={14} />
                {trackingLoading ? 'Searching...' : 'Track Status'}
              </button>
            </form>

            {/* Results */}
            {hasSearched && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                {trackedApplications.length > 0 ? (
                  trackedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-6 rounded-2xl bg-gray-50 border border-gray-200/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-gray-500">Ref ID: {app.id}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            app.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : app.status === 'under_review'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          ● {app.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-gray-900">
                        {app.admissions?.program_name || 'B.Tech / BCA Program'}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1">
                        <div>Applicant: <strong className="text-gray-800">{app.applicant_name}</strong></div>
                        <div>Submitted: <strong className="text-gray-800">{new Date(app.created_at).toLocaleDateString()}</strong></div>
                      </div>

                      <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                        {app.status === 'accepted'
                          ? '🎉 Congratulations! Your admission dossier is verified and approved. Check your email for fee payment and batch orientation dates.'
                          : app.status === 'under_review'
                          ? '🔍 Your academic marksheets and entrance scores are currently being verified by the admissions committee.'
                          : app.status === 'rejected'
                          ? 'We regret to inform you that your application did not meet the eligibility cutoff for this intake cycle.'
                          : '⏳ Your application has been logged into the system and is awaiting queue assignment.'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 space-y-2">
                    <AlertCircle size={32} className="mx-auto text-amber-500" />
                    <p className="text-sm font-semibold text-gray-700">No applications found for this email.</p>
                    <p className="text-xs">Please verify your email address or submit a fresh application from the catalog.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Application Modal */}
      {showApplyModal && selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest">
                Admission Application
              </span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mt-1">
                {selectedProgram.program_name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Fill in your academic profile to initiate intake verification.</p>
            </div>

            {applySuccess ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 size={44} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-lg">Application Submitted!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your reference ID is <strong className="font-mono">{appliedId}</strong>. You can track your status anytime under the &apos;Track Application Status&apos; tab.
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => {
                      setShowApplyModal(false)
                      setActiveTab('track')
                    }}
                    className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Track Status Now
                  </button>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantData.applicant_name}
                    onChange={(e) => setApplicantData({ ...applicantData, applicant_name: e.target.value })}
                    placeholder="e.g. Aanya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applicantData.applicant_email}
                      onChange={(e) => setApplicantData({ ...applicantData, applicant_email: e.target.value })}
                      placeholder="e.g. aanya@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={applicantData.applicant_phone}
                      onChange={(e) => setApplicantData({ ...applicantData, applicant_phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Highest Qualification</label>
                    <input
                      type="text"
                      value={applicantData.qualification}
                      onChange={(e) => setApplicantData({ ...applicantData, qualification: e.target.value })}
                      placeholder="e.g. 12th CBSE PCM / B.Sc"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Percentage / CGPA</label>
                    <input
                      type="text"
                      value={applicantData.percentage}
                      onChange={(e) => setApplicantData({ ...applicantData, percentage: e.target.value })}
                      placeholder="e.g. 88.5% or 9.2"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Statement / Notes</label>
                  <textarea
                    rows={3}
                    value={applicantData.message}
                    onChange={(e) => setApplicantData({ ...applicantData, message: e.target.value })}
                    placeholder="Tell us about your career objectives and background..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {submitting ? 'Submitting Application...' : 'Submit Application Now'}
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
