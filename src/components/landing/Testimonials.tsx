'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    quote: 'AAGAJ INFOTECH LMS has completely changed the way we learn and grow. The platform is intuitive, powerful and truly student-focused.',
    author: 'Ananya Verma',
    role: 'B.Tech CSE Student',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    isPrimary: true,
  },
  {
    id: 2,
    quote: 'We have hired 20+ interns from AAGAJ. The students are pre-screened, highly competent, and match our exact tech requirements from day one.',
    author: 'Rajesh Kumar',
    role: 'HR Lead, TechVerve Solutions',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    isPrimary: false,
  },
  {
    id: 3,
    quote: 'Integrating the platform boosted student engagement by 80% and streamlined our academic courses and assessments pipeline.',
    author: 'Dr. Ramesh Sharma',
    role: 'Principal, City Engineering College',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    isPrimary: false,
  },
]

export default function Testimonials() {
  const primaryTestimonial = testimonials.find(t => t.isPrimary)
  const secondaryTestimonials = testimonials.filter(t => !t.isPrimary)

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-[#FF2D8D]/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#9C27FF]/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] sm:text-xs font-bold text-[#9C27FF] uppercase tracking-[0.2em] block mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
            What Our <span className="text-gradient">Community</span> Says
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-4 max-w-xl mx-auto font-normal leading-relaxed">
            Real stories from students, partner universities, and hiring corporate managers.
          </p>
        </div>

        {/* Grid layout matching screenshot styling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Primary Dark Card */}
          {primaryTestimonial && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 rounded-[32px] bg-gradient-to-br from-[#1E1B4B] to-[#0A071B] p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-indigo-950/20 text-white min-h-[350px]"
            >
              {/* Glow Accent in Card */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF2D8D]/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#9C27FF]/10 blur-3xl pointer-events-none" />

              {/* Quote Icon */}
              <div className="text-[#FF2D8D] opacity-40 mb-6">
                <Quote size={40} className="fill-current" />
              </div>

              {/* Quote text */}
              <p className="text-lg sm:text-xl font-heading font-semibold leading-relaxed relative z-10">
                &ldquo;{primaryTestimonial.quote}&rdquo;
              </p>

              {/* Bottom Profile Details */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                  <img
                    src={primaryTestimonial.avatar}
                    alt={primaryTestimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-heading font-extrabold text-white">
                    {primaryTestimonial.author}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {primaryTestimonial.role}
                  </p>
                </div>
                {/* 5 Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(primaryTestimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* Right Secondary Light Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {secondaryTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-lg shadow-gray-100/40 flex flex-col justify-between flex-1 hover:border-[#FF2D8D]/20 transition-all duration-300"
              >
                <div className="text-gray-200 mb-4">
                  <Quote size={24} className="fill-current" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shrink-0">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-heading font-extrabold text-gray-900 truncate">
                      {testimonial.author}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                      {testimonial.role}
                    </p>
                  </div>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={11} className="fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
