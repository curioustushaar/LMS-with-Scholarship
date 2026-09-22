'use client'

import Link from 'next/link'
import { Star, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 relative border-t border-gray-100">
      {/* Premium Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-cyan-400 opacity-80" />
      {/* Soft Glow overlay behind border */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#FF2D8D]/5 to-transparent blur-md pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Logo & Student Credit Card (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="GRAVITY by AAGAJ Foundation" className="h-10 sm:h-12 w-auto object-contain" />
            </Link>

            <p className="text-xs text-gray-400 font-normal max-w-sm leading-relaxed">
              Gravity LMS is a complete learning ecosystem designed to connect students, academic institutions, employers, and scholarships through modern interactive systems.
            </p>

            {/* In-Footer Student Credit Card */}
            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#0A071B] border border-white/5 rounded-2xl p-4 shadow-md max-w-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#FF2D8D]/5 blur-xl pointer-events-none" />
              <p className="text-[10px] text-white/95 italic leading-relaxed">
                &ldquo;The dashboard is extremely clean and makes managing my coursework, quizzes, and placements simple.&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
                    alt="Ananya Verma"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-bold text-white truncate">Ananya Verma</h4>
                  <p className="text-[8px] text-gray-400 truncate">B.Tech CSE Student</p>
                </div>
                <div className="flex items-center text-amber-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={8} className="fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Column (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-heading font-extrabold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
              {['Home', 'About Us', 'Courses', 'Admissions', 'Internships', 'Scholarships'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#FF2D8D] transition-colors flex items-center gap-0.5">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links Column (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-heading font-extrabold text-gray-900 uppercase tracking-wider">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
              {['Employers', 'School Partners', 'Notices', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#FF2D8D] transition-colors flex items-center gap-0.5">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Column (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-heading font-extrabold text-gray-900 uppercase tracking-wider">
              Contact Details
            </h4>
            <ul className="space-y-3 text-xs text-gray-400 font-semibold">
              <li className="flex gap-2 items-start">
                <MapPin size={13} className="text-[#FF2D8D] shrink-0 mt-0.5" />
                <span className="text-gray-500 font-normal leading-normal">
                  Bhupatipur Road, Near Krishi Anusandhan Kendra, Patna - 800020, Bihar
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Mail size={13} className="text-[#9C27FF] shrink-0 mt-0.5" />
                <a href="mailto:aagajfoundationpaliganj@gmail.com" className="text-gray-500 font-normal hover:text-[#FF2D8D] transition-colors break-all">
                  aagajfoundationpaliganj@gmail.com
                </a>
              </li>
              <li className="flex gap-2 items-start">
                <Phone size={13} className="text-[#FF2D8D] shrink-0 mt-0.5" />
                <a href="tel:+919431430464" className="text-gray-500 font-normal hover:text-[#FF2D8D] transition-colors">
                  +91 9431430464
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-400 font-semibold">
            &copy; 2026 GRAVITY by AAGAJ Foundation. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] text-gray-400 font-semibold">
            <a href="#" className="hover:text-[#FF2D8D] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF2D8D] transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-[#FF2D8D] transition-colors">Refund Policy</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
