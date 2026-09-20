'use client'

import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import Newsletter from '@/components/landing/Newsletter'
import Marquee from '@/components/landing/Marquee'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Header Banner */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-pink-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
            Reach Out to Gravity
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
            Connect with Our <span className="text-gradient">Academic & Support Team</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Have questions about course admissions, fee concessions, employer recruitment drives, or platform integration? We are here to help.
          </p>
        </div>
      </section>

      {/* Interactive Contact & Newsletter Component */}
      <Newsletter />

      {/* Partner Marquee */}
      <Marquee />

      <Footer />
    </div>
  )
}
