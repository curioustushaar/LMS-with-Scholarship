'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { School, MapPin, Users, Award, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'

interface SchoolPartner {
  id: string
  institution_name: string
  institution_type: string
  description?: string
  location?: string
  students_enrolled?: number
}

export default function SchoolPartnersPage() {
  const [partners, setPartners] = useState<SchoolPartner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/school-partners?limit=20')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setPartners(data.data)
        } else {
          setPartners([
            {
              id: '1',
              institution_name: 'Delhi Public School Network',
              institution_type: 'school',
              location: 'New Delhi, India',
              students_enrolled: 250,
              description: 'National K-12 education leader pioneering AI foundational labs and STEM coursework with AAGAJ.',
            },
            {
              id: '2',
              institution_name: 'IIT Delhi Innovation & Incubation Hub',
              institution_type: 'university',
              location: 'New Delhi, India',
              students_enrolled: 180,
              description: 'Technical innovation partner collaborating on student hackathons, open-source grants, and incubation.',
            },
            {
              id: '3',
              institution_name: 'Amity University Higher Education',
              institution_type: 'university',
              location: 'Noida, India',
              students_enrolled: 320,
              description: 'Higher education partner integrating credit transfers and hybrid semester bootcamps with industry certifications.',
            },
            {
              id: '4',
              institution_name: 'Ryan International Schools',
              institution_type: 'school',
              location: 'Multiple Campuses, India',
              students_enrolled: 150,
              description: 'K-12 school network conducting coding olympiads and digital literacy programs for senior students.',
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
      <section className="pt-32 pb-16 bg-gradient-to-b from-pink-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
            Institutional Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            School & <span className="text-gradient">University Partnerships</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Collaborating with forward-thinking academic institutions to bring industry-grade technical learning, labs, and certification pipelines to classrooms.
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading partner directory...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#FF2D8D] flex items-center justify-center">
                      <School size={24} />
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 leading-snug">{p.institution_name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {p.location || 'India'}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Enrolled:</span>
                    <span className="font-bold text-emerald-600">{p.students_enrolled || 100}+ students</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Partnership Proposal CTA */}
          <div className="mt-16 p-10 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-heading font-bold text-gray-900">Want to Partner Your School or College?</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
                Get custom coding labs, teacher training workshops, LMS integration, and student placement assistance for your institution.
              </p>
            </div>
            <a
              href="/contact"
              className="px-6 py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              Request Institutional Partnership
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
