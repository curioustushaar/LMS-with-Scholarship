'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion } from 'framer-motion'
import { Building2, MapPin, Users, Briefcase, Star, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface Employer {
  id: string
  company_name: string
  industry?: string
  description?: string
  location?: string
  partnership_type: string
  is_featured: boolean
}

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/employers?limit=20')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setEmployers(data.data)
        } else {
          setEmployers([
            {
              id: '1',
              company_name: 'TechVerve Solutions',
              industry: 'IT Services & Cloud Infrastructure',
              location: 'Bangalore, India',
              partnership_type: 'hiring',
              is_featured: true,
              description: 'Leading digital engineering firm recruiting full-stack developers, cloud architects, and QA engineers.',
            },
            {
              id: '2',
              company_name: 'Creative Minds Studio',
              industry: 'Product Design & Digital Experience',
              location: 'Mumbai, India',
              partnership_type: 'hiring',
              is_featured: true,
              description: 'Global design agency partnering with AAGAJ for talent pipelines in UI/UX and product design.',
            },
            {
              id: '3',
              company_name: 'DataWave Analytics',
              industry: 'Data Science & Enterprise AI',
              location: 'Hyderabad, India',
              partnership_type: 'training',
              is_featured: true,
              description: 'Consulting enterprise delivering sponsored masterclasses and hiring high-performing data science graduates.',
            },
            {
              id: '4',
              company_name: 'CloudNex Systems',
              industry: 'DevOps & Multi-Cloud',
              location: 'Pune, India',
              partnership_type: 'all',
              is_featured: true,
              description: 'Strategic technical partner conducting hackathons, code reviews, and off-campus recruitment.',
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
            Employer Alliances & Talent Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            Our <span className="text-gradient">Hiring Partners</span> & Corporate Network
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover top tech enterprises and innovative startups that hire skilled developers, designers, and data professionals directly from AAGAJ INFOTECH.
          </p>
        </div>
      </section>

      {/* Employer Directory Grid */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading employer directory...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {employers.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#9C27FF] flex items-center justify-center font-bold text-xl">
                        <Building2 size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
                        {emp.industry || 'Tech'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-gray-900">{emp.company_name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {emp.location || 'Pan India'}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{emp.description}</p>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">Alliance Type:</span>
                      <span className="font-bold text-gray-800 capitalize">{emp.partnership_type} Partner</span>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-50">
                    <a
                      href="/contact"
                      className="block w-full text-center py-3 bg-gray-50 hover:bg-gradient-to-r hover:from-[#FF2D8D] hover:to-[#9C27FF] hover:text-white text-gray-700 text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Partner with {emp.company_name}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
