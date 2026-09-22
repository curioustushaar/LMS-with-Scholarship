'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Clock, Users, ArrowUpRight } from 'lucide-react'

interface CourseItem {
  id: string | number
  title: string
  category: string
  thumbnail_url?: string
  image?: string
  instructor_name?: string
  instructor_avatar?: string
  duration_weeks?: number
  duration?: string
  rating?: number
  reviews_count?: number
  reviewsCount?: number
  students_count?: number | string
  studentsCount?: string
  price: string
  badgeColor?: string
}

export default function Courses() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/courses?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data)) {
          const mapped = data.data.map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category || (c.level ? `${c.level.charAt(0).toUpperCase() + c.level.slice(1)}` : 'Program'),
            image: c.image || c.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
            instructor_name: c.instructor_name || 'Academic Mentor',
            instructor_avatar: c.instructor_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            duration: c.duration_weeks ? `${c.duration_weeks} Weeks` : (c.duration || '4 Weeks'),
            rating: c.rating || 4.9,
            reviewsCount: c.reviews_count || 120,
            studentsCount: c.students_count ? `${c.students_count}` : '1.2k',
            price: c.price || 'Free / Included',
            badgeColor:
              (c.category?.toLowerCase() === 'design' || c.title?.toLowerCase().includes('design'))
                ? 'bg-pink-50 text-[#FF2D8D] border-pink-100'
                : (c.category?.toLowerCase() === 'data science' || c.title?.toLowerCase().includes('data'))
                ? 'bg-blue-50 text-blue-600 border-blue-100'
                : 'bg-purple-50 text-[#9C27FF] border-purple-100',
          }))
          setCourses(mapped)
        }
      })
      .catch((err) => console.error('Error fetching landing courses:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="courses" className="relative py-24 bg-white">
      {/* Background radial soft light purple glow */}
      <div className="absolute top-[20%] left-0 w-80 h-80 rounded-full bg-[#9C27FF]/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-0 w-80 h-80 rounded-full bg-[#FF2D8D]/2 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-3">
            Academic Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
            Featured <span className="text-gradient">Courses</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-4 max-w-xl mx-auto font-normal leading-relaxed">
            Explore top trending courses designed and structured by industry experts to boost your career.
          </p>
        </div>

        {/* Loading state skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse p-4 space-y-4">
                <div className="aspect-[16/10] bg-gray-200 rounded-2xl w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100 max-w-2xl mx-auto">
            <p className="text-gray-500 font-medium">New courses will be published soon by the administrator.</p>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Course Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm ${course.badgeColor || 'bg-pink-50 text-[#FF2D8D] border-pink-100'}`}>
                      {course.category}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-white/40">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-gray-900 leading-none">{course.rating}</span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Meta details */}
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-[#FF2D8D]" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={13} className="text-[#9C27FF]" />
                      <span>{course.studentsCount} Students</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-extrabold text-lg text-gray-900 group-hover:text-[#FF2D8D] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Instructor Profile */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0">
                      <img
                        src={course.instructor_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                        alt={course.instructor_name || 'Instructor'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-gray-400 font-semibold leading-none">Instructor</span>
                      <span className="text-xs font-bold text-gray-800 truncate mt-0.5">{course.instructor_name}</span>
                    </div>
                  </div>

                  {/* Bottom Bar: Price & CTA */}
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Course Fee</span>
                      <span className="text-lg font-heading font-extrabold text-gray-900 leading-tight">
                        {course.price}
                      </span>
                    </div>

                    <Link href="/courses">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-[#FF2D8D] group-hover:to-[#9C27FF] group-hover:text-white text-gray-700 flex items-center justify-center transition-all shadow-sm"
                        aria-label={`View ${course.title}`}
                      >
                        <ArrowUpRight size={18} />
                      </motion.button>
                    </Link>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {courses.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/courses">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] font-bold text-xs rounded-full bg-white transition-all shadow-sm inline-flex items-center gap-2 group"
              >
                Explore Full Course Catalog
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.button>
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}
