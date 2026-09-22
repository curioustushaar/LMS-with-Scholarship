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
    fetch('/api/public/school-partners?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setPartners(data.data)
        } else {
          setPartners([])
        }
      })
      .catch((err) => {
        console.error('Failed to fetch school partners:', err)
        setPartners([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-pink-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
            Institutional & Academy Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            School & <span className="text-gradient">Coaching Partners</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Collaborating with verified schools, coaching institutes, and academic centers to deliver accredited hybrid learning and scholarship programs.
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-50 rounded w-1/2" />
                  <div className="h-12 bg-gray-50 rounded w-full" />
                </div>
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">Institutional Partners Directory</p>
              <p className="text-xs text-gray-400 mt-1">Verified partner schools and coaching centers will appear here once onboarded.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#FF2D8D] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <School size={24} />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        p.institution_type === 'coaching'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-purple-50 text-purple-600 border border-purple-200'
                      }`}>
                        {p.institution_type === 'coaching' ? '🎓 Coaching Partner' : '🏫 School Partner'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-lg text-gray-900 leading-snug">{p.institution_name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {p.location || 'Pan-India'}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{p.description || 'Official academic partner integrated with Gravity hybrid scholarship and skill programs.'}</p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified Partner
                    </span>
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
