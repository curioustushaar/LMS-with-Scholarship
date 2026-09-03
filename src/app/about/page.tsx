'use client'

import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import About from '@/components/landing/About'
import Testimonials from '@/components/landing/Testimonials'
import Stats from '@/components/landing/Stats'
import Marquee from '@/components/landing/Marquee'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Award, Users, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Hero Banner */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-pink-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
            About Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900">
            Empowering Minds. <span className="text-gradient">Shaping Futures.</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AAGAJ INFOTECH is building India&apos;s most integrated technology and professional education ecosystem, connecting students with leading mentors, real projects, and dream careers.
          </p>
        </div>
      </section>

      {/* Core Component */}
      <About />

      {/* Stats counter */}
      <Stats />

      {/* Partner Marquee */}
      <Marquee />

      {/* Reviews */}
      <Testimonials />

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl font-heading font-bold">Ready to Start Your Learning Journey?</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Explore our accredited course syllabus, check your eligibility for scholarships, or connect with an academic counselor today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/courses">
              <button className="px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-full shadow-lg">
                Explore Courses
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white text-xs font-bold rounded-full transition-all">
                Contact Counselors
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
