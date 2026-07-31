import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import Features from '@/components/landing/Features'
import Modules from '@/components/landing/Modules'
import Journey from '@/components/landing/Journey'
import Courses from '@/components/landing/Courses'
import Internships from '@/components/landing/Internships'
import Scholarships from '@/components/landing/Scholarships'
import Marquee from '@/components/landing/Marquee'
import Testimonials from '@/components/landing/Testimonials'
import Newsletter from '@/components/landing/Newsletter'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans selection:bg-[#FF2D8D]/10 selection:text-[#FF2D8D]">
      {/* Sticky Navbar */}
      <Header />

      {/* Hero Block */}
      <Hero />

      {/* Statistics Row */}
      <Stats />

      {/* Features Grid */}
      <Features />

      {/* Our Powerful Modules Segment */}
      <Modules />

      {/* Student Journey Pipeline */}
      <Journey />

      {/* Academic Featured Courses */}
      <Courses />

      {/* Latest Internships Openings */}
      <Internships />

      {/* Available Scholarships */}
      <Scholarships />

      {/* Infinite Client/Partner Marquee */}
      <Marquee />

      {/* Community Testimonials & Reviews */}
      <Testimonials />

      {/* Newsletter Block & Let's Connect */}
      <Newsletter />

      {/* Footer Segment */}
      <Footer />
    </div>
  )
}
