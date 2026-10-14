'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Star, Clock, Users, ArrowUpRight, BookOpen, Filter } from 'lucide-react'

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
  students_count?: number | string
  price: string
  level?: string
  description?: string
  badgeColor?: string
}

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Development', 'Design', 'Data Science', 'Cloud & DevOps', 'Business']

  useEffect(() => {
    fetch('/api/public/courses?limit=30')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data)) {
          const mapped = data.data.map((c: any) => ({
            id: c.id,
            title: c.title,
            category: c.category || (c.level ? `${c.level.charAt(0).toUpperCase() + c.level.slice(1)}` : 'Development'),
            image: c.image || c.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
            instructor_name: c.instructor_name || 'Academic Mentor',
            instructor_avatar: c.instructor_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
            duration: c.duration_weeks ? `${c.duration_weeks} Weeks` : (c.duration || '4 Weeks'),
            rating: c.rating || 4.9,
            reviews_count: c.reviews_count || 120,
            students_count: c.students_count ? `${c.students_count}` : '1.2k',
            price: c.price || 'Free / Included',
            description: c.description || 'Master practical concepts with hands-on learning and evaluations.',
            level: c.level || 'Intermediate',
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
      .catch((err) => console.error('Error loading public courses:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredCourses = courses.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-purple-50/40 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-[#9C27FF] uppercase tracking-widest px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
              Complete Course Catalog
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight">
              Explore Our <span className="text-gradient">Academic Programs</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              Industry-aligned technical courses designed to build real-world competencies and portfolio credentials.
            </p>
          </div>

          {/* Search Bar & Category Filters */}
          <div className="mt-10 max-w-4xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search courses by keyword, topic, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF] text-sm"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200/60 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading courses catalog...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-16 text-center text-gray-400 space-y-3">
              <BookOpen size={36} className="mx-auto opacity-40 stroke-1" />
              <p className="text-base font-semibold text-gray-600">No courses match your search.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#FF2D8D] bg-pink-50"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm ${course.badgeColor || 'bg-pink-50 text-[#FF2D8D] border-pink-100'}`}>
                        {course.category}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-gray-900 leading-none">{course.rating}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-[#FF2D8D]" />
                        <span>{course.duration}</span>
                      </div>
                      <span className="font-semibold text-gray-500">{course.level}</span>
                    </div>

                    <h3 className="font-heading font-extrabold text-lg text-gray-900 group-hover:text-[#FF2D8D] transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{course.description}</p>

                    <div className="pt-2 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0">
                        <img
                          src={course.instructor_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                          alt="Mentor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-400 font-semibold leading-none">Instructor</span>
                        <span className="text-xs font-bold text-gray-800 truncate mt-0.5">{course.instructor_name}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Course Fee</span>
                        <span className="text-lg font-heading font-extrabold text-gray-900 leading-tight">
                          {course.price}
                        </span>
                      </div>

                      <a href="https://students.aagajfoundation.in/login">
                        <button className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1">
                          Enroll Now
                          <ArrowUpRight size={14} />
                        </button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
