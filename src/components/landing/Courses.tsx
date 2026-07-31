'use client'

import { motion } from 'framer-motion'
import { Star, Clock, Users, ArrowUpRight } from 'lucide-react'

const coursesData = [
  {
    id: 1,
    title: 'UI/UX Design Management',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=400&q=80',
    instructor: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    },
    duration: '6 Weeks',
    rating: 4.8,
    reviewsCount: 142,
    studentsCount: '1.2k',
    price: '₹5,999',
    badgeColor: 'bg-pink-50 text-[#FF2D8D] border-pink-100',
  },
  {
    id: 2,
    title: 'Full Stack Development',
    category: 'Development',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    instructor: {
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    },
    duration: '12 Weeks',
    rating: 4.9,
    reviewsCount: 310,
    studentsCount: '3.4k',
    price: '₹12,499',
    badgeColor: 'bg-purple-50 text-[#9C27FF] border-purple-100',
  },
  {
    id: 3,
    title: 'Data Science with Python',
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=400&q=80',
    instructor: {
      name: 'John Brown',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    },
    duration: '10 Weeks',
    rating: 4.7,
    reviewsCount: 189,
    studentsCount: '2.1k',
    price: '₹9,999',
    badgeColor: 'bg-blue-50 text-blue-600 border-blue-100',
  },
]

export default function Courses() {
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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coursesData.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                boxShadow: '0 20px 30px -10px rgba(156, 39, 255, 0.08)'
              }}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between transition-all duration-300"
            >
              <div>
                {/* Course Thumbnail Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-wide uppercase ${course.badgeColor} bg-white/95 backdrop-blur-sm shadow-sm`}>
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Course Details Panel */}
                <div className="p-6">
                  {/* Instructor and Duration */}
                  <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 border border-gray-50">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-gray-600 font-semibold">{course.instructor.name}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      {course.duration}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-gray-900 mt-4 leading-tight group-hover:text-[#FF2D8D] transition-colors duration-200">
                    {course.title}
                  </h3>

                  {/* Ratings and Enrollments */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-400">
                        <Star size={14} className="fill-current" />
                      </div>
                      <span className="text-gray-800 font-extrabold">{course.rating}</span>
                      <span className="text-[10px]">({course.reviewsCount} reviews)</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {course.studentsCount} Students
                    </span>
                  </div>
                </div>
              </div>

              {/* Price and CTA Footer */}
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
                <span className="text-base sm:text-lg font-heading font-extrabold text-gray-900">
                  {course.price}
                </span>
                <button className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] rounded-full shadow-sm hover:shadow-md hover:shadow-[#FF2D8D]/10 transition-all flex items-center gap-1">
                  Enroll Now
                  <ArrowUpRight size={13} />
                </button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
