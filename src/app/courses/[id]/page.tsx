'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion } from 'framer-motion'
import {
  Star,
  Clock,
  Users,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Shield,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
} from 'lucide-react'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = (params?.id as string) || '1'

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>(['w-1', 'w-2'])
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  // Enrollment Form State
  const [enrollData, setEnrollData] = useState({
    student_name: '',
    student_email: '',
    phone: '',
  })
  const [enrolling, setEnrolling] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/public/courses/${courseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCourse(data.data)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [courseId])

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    )
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrolling(true)
    try {
      const res = await fetch('/api/public/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          ...enrollData,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEnrollSuccess(true)
        setTimeout(() => {
          router.push('/student/courses')
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      router.push('/student/courses')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <Header />
        <div className="pt-40 pb-20 text-center text-gray-400">Loading course curriculum...</div>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <Header />
        <div className="pt-40 pb-20 text-center space-y-4">
          <h2 className="text-2xl font-bold">Course Not Found</h2>
          <Link href="/courses" className="text-[#FF2D8D] font-bold text-sm">
            ← Return to Courses Catalog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Hero Header */}
      <section className="pt-32 pb-14 bg-gradient-to-b from-slate-900 to-gray-900 text-white relative overflow-hidden">
        {/* Soft Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF2D8D]/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#9C27FF]/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Courses Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF2D8D]/20 text-[#FF2D8D] border border-[#FF2D8D]/30">
                  {course.category || 'Engineering'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                  {course.level || 'Intermediate'}
                </span>
                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-400">{course.rating || 4.9}</span>
                  <span className="text-gray-400">({course.reviews_count || 310} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl font-normal">
                {course.description}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#FF2D8D]" />
                  <span>{course.duration_weeks || 12} Weeks Intensive</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#9C27FF]" />
                  <span>{course.students_count || 1200}+ Students Enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-emerald-400" />
                  <span>Verified Completion Certificate</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <img
                  src={
                    course.instructor_avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={course.instructor_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FF2D8D]"
                />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Course Creator & Lead Mentor</div>
                  <div className="text-sm font-bold text-white">{course.instructor_name || 'Jane Smith'}</div>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Price & CTA */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-6 text-white shadow-2xl">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-800">
                <img
                  src={
                    course.thumbnail_url ||
                    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                  }
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">One-Time Fee</span>
                  <span className="text-3xl font-heading font-extrabold text-white">{course.price || '₹12,499'}</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full">
                  Scholarship Eligible
                </span>
              </div>

              <button
                onClick={() => setShowEnrollModal(true)}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
              >
                Enroll in Course Now
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Instant access to lessons, tasks, code assignments, and instructor discord.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Curriculum & Details Body */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column: Curriculum */}
          <div className="lg:col-span-8 space-y-10">
            {/* Learning Outcomes */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-4">
              <h3 className="text-xl font-heading font-bold text-gray-900">What You Will Master</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(
                  course.outcomes || [
                    'Master modern React 19 hooks and Next.js 14 App Router patterns',
                    'Design resilient database schemas with PostgreSQL & Supabase RLS',
                    'Deploy production applications with Docker, Vercel, and GitHub Actions',
                    'Build end-to-end portfolio projects with evaluation badges',
                  ]
                ).map((outcome: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                    <CheckCircle2 size={16} className="text-[#FF2D8D] shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus Curriculum Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-gray-900">Course Curriculum & Modules</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {course.weeks?.length || 4} structured modules • High definition video lessons & code repositories
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {course.weeks && course.weeks.length > 0 ? (
                  course.weeks.map((week: any) => {
                    const isExpanded = expandedWeeks.includes(week.id)
                    return (
                      <div
                        key={week.id}
                        className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm transition-all"
                      >
                        <button
                          onClick={() => toggleWeek(week.id)}
                          className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#FF2D8D] flex items-center justify-center font-bold text-xs shrink-0">
                              W{week.week_number}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{week.title}</h4>
                              <p className="text-[11px] text-gray-400 mt-0.5">{week.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-gray-400 shrink-0 ml-2">
                            <span className="text-xs font-semibold">{week.videos?.length || 3} Lessons</span>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </button>

                        {/* Collapsible Video Lessons */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 space-y-2 border-t border-gray-100/80 bg-gray-50/40">
                            {week.videos && week.videos.length > 0 ? (
                              week.videos.map((video: any) => (
                                <div
                                  key={video.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 text-xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <PlayCircle size={16} className="text-[#9C27FF] shrink-0" />
                                    <span className="font-semibold text-gray-800">{video.title}</span>
                                  </div>
                                  <span className="text-[11px] text-gray-400 font-mono">
                                    {video.duration_minutes ? `${video.duration_minutes}m` : '35m'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-gray-400">Lesson videos scheduled in cohort.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-gray-400">Curriculum loading...</div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-gray-900">Course Includes</h4>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  <PlayCircle size={16} className="text-[#FF2D8D]" />
                  <span>30+ Hours of on-demand HD videos</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-[#9C27FF]" />
                  <span>Full source code access on GitHub</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award size={16} className="text-emerald-600" />
                  <span>Industry-recognized certification</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-blue-600" />
                  <span>Direct mentor Q&A and 1-on-1 code reviews</span>
                </div>
              </div>
            </div>

            {/* Mentor Bio */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-3">
              <h4 className="text-base font-bold text-gray-900">About the Mentor</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {course.instructor_bio ||
                  'Experienced industry lead mentor who has trained over 5,000+ engineers into top-tier tech firms.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-5 relative">
            <button
              onClick={() => setShowEnrollModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest">
                Student Course Enrollment
              </span>
              <h3 className="text-xl font-heading font-bold text-gray-900 mt-1">{course.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Enter your student details to activate course access immediately.</p>
            </div>

            {enrollSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-lg">Enrolled Successfully!</h4>
                <p className="text-xs text-emerald-700">Redirecting to your Student Learning Dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollData.student_name}
                    onChange={(e) => setEnrollData({ ...enrollData, student_name: e.target.value })}
                    placeholder="e.g. Aanya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={enrollData.student_email}
                    onChange={(e) => setEnrollData({ ...enrollData, student_email: e.target.value })}
                    placeholder="e.g. aanya@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp / Phone</label>
                  <input
                    type="tel"
                    value={enrollData.phone}
                    onChange={(e) => setEnrollData({ ...enrollData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enrolling}
                  className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Award size={16} />
                  {enrolling ? 'Activating Enrollment...' : 'Confirm & Start Learning'}
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
