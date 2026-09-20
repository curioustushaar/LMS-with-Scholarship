import dynamic from 'next/dynamic'
import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import About from '@/components/landing/About'
import Features from '@/components/landing/Features'
import Modules from '@/components/landing/Modules'
import Journey from '@/components/landing/Journey'
import Footer from '@/components/landing/Footer'

const Courses = dynamic(() => import('@/components/landing/Courses'))
const Admissions = dynamic(() => import('@/components/landing/Admissions'))
const Internships = dynamic(() => import('@/components/landing/Internships'))
const Scholarships = dynamic(() => import('@/components/landing/Scholarships'))
const Employers = dynamic(() => import('@/components/landing/Employers'))
const SchoolPartners = dynamic(() => import('@/components/landing/SchoolPartners'))
const Training = dynamic(() => import('@/components/landing/Training'))
const Marquee = dynamic(() => import('@/components/landing/Marquee'))
const Testimonials = dynamic(() => import('@/components/landing/Testimonials'))
const Newsletter = dynamic(() => import('@/components/landing/Newsletter'))
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GRAVITY | AAGAJ Foundation',
  description: 'GRAVITY by AAGAJ Foundation is a complete learning ecosystem connecting students, schools, employers, and scholarships through modern interactive technology.',
  alternates: {
    canonical: 'https://aagajfoundation.in/',
  },
  openGraph: {
    title: 'GRAVITY | AAGAJ Foundation',
    description: 'Empowering Education. Elevating Careers. GRAVITY by AAGAJ Foundation connects students, schools, employers, and scholarships.',
    url: 'https://aagajfoundation.in/',
    siteName: 'GRAVITY',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans selection:bg-[#FF2D8D]/10 selection:text-[#FF2D8D]">
      {/* 1. Sticky Navbar */}
      <Header />

      {/* 2. Hero Block (#home) */}
      <Hero />

      {/* 3. Statistics Row */}
      <Stats />

      {/* 4. About Us Segment (#about) */}
      <About />

      {/* 5. Features Grid */}
      <Features />

      {/* 6. Powerful Modules Segment */}
      <Modules />

      {/* 7. Student Journey Pipeline */}
      <Journey />

      {/* 8. Academic Featured Courses (#courses) */}
      <Courses />

      {/* 9. Admissions & Intakes (#admissions) */}
      <Admissions />

      {/* 10. Latest Internships Openings (#internships) */}
      <Internships />

      {/* 11. Available Scholarships (#scholarships) */}
      <Scholarships />

      {/* 12. Top Hiring Employers (#employers) */}
      <Employers />

      {/* 13. School & Institutional Partners (#school-partners) */}
      <SchoolPartners />

      {/* 14. Professional Training Programs (#training) */}
      <Training />

      {/* 15. Infinite Client/Partner Marquee */}
      <Marquee />

      {/* 16. Community Testimonials & Reviews */}
      <Testimonials />

      {/* 17. Contact Us & Newsletter Block (#contact) */}
      <Newsletter />

      {/* 18. Footer Segment */}
      <Footer />
    </div>
  )
}
