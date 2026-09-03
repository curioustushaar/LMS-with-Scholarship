import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import About from '@/components/landing/About'
import Features from '@/components/landing/Features'
import Modules from '@/components/landing/Modules'
import Journey from '@/components/landing/Journey'
import Courses from '@/components/landing/Courses'
import Admissions from '@/components/landing/Admissions'
import Internships from '@/components/landing/Internships'
import Scholarships from '@/components/landing/Scholarships'
import Employers from '@/components/landing/Employers'
import SchoolPartners from '@/components/landing/SchoolPartners'
import Training from '@/components/landing/Training'
import Marquee from '@/components/landing/Marquee'
import Testimonials from '@/components/landing/Testimonials'
import Newsletter from '@/components/landing/Newsletter'
import Footer from '@/components/landing/Footer'

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
