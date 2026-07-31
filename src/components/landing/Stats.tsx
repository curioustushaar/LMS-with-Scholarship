'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, GraduationCap, Briefcase, School, Award, Building2 } from 'lucide-react'

// Custom Count-up Component using Intersection Observer
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [inView, setInView] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold: 0.1 }
    )

    const el = elementRef.current
    if (el) {
      observer.observe(el)
    }

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [])

  useEffect(() => {
    if (!inView) return

    let startTime: number | null = null
    const duration = 2000 // 2 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing outQuad
      const easeProgress = progress * (2 - progress)
      const currentCount = Math.floor(easeProgress * target)
      
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(animate)
  }, [inView, target])

  return <span ref={elementRef}>{count}{suffix}</span>
}

const statsData = [
  {
    id: 1,
    target: 1000,
    suffix: '+',
    label: 'Students',
    icon: Users,
    color: 'text-[#FF2D8D]',
    bgColor: 'bg-[#FF2D8D]/5',
    borderColor: 'border-[#FF2D8D]/10',
  },
  {
    id: 2,
    target: 75,
    suffix: '+',
    label: 'Courses',
    icon: GraduationCap,
    color: 'text-[#9C27FF]',
    bgColor: 'bg-[#9C27FF]/5',
    borderColor: 'border-[#9C27FF]/10',
  },
  {
    id: 3,
    target: 100,
    suffix: '+',
    label: 'Internships',
    icon: Briefcase,
    color: 'text-[#FF2D8D]',
    bgColor: 'bg-[#FF2D8D]/5',
    borderColor: 'border-[#FF2D8D]/10',
  },
  {
    id: 4,
    target: 40,
    suffix: '+',
    label: 'Partner Schools',
    icon: School,
    color: 'text-[#9C27FF]',
    bgColor: 'bg-[#9C27FF]/5',
    borderColor: 'border-[#9C27FF]/10',
  },
  {
    id: 5,
    target: 35,
    suffix: '+',
    label: 'Scholarships',
    icon: Award,
    color: 'text-[#FF2D8D]',
    bgColor: 'bg-[#FF2D8D]/5',
    borderColor: 'border-[#FF2D8D]/10',
  },
  {
    id: 6,
    target: 50,
    suffix: '+',
    label: 'Hiring Companies',
    icon: Building2,
    color: 'text-[#9C27FF]',
    bgColor: 'bg-[#9C27FF]/5',
    borderColor: 'border-[#9C27FF]/10',
  },
]

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Stats() {
  return (
    <section className="relative py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-100/40 relative overflow-hidden"
        >
          {/* Subtle background gradients inside the container */}
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-[#FF2D8D]/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-[#9C27FF]/5 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-6 relative z-10 divide-y md:divide-y-0 lg:divide-x divide-gray-100">
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={stat.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className={`flex flex-col items-center text-center p-2 pt-6 first:pt-2 md:pt-2 lg:px-4 lg:first:pl-0 lg:border-l-0 ${
                    index % 2 === 0 ? 'border-gray-50' : ''
                  }`}
                >
                  {/* Icon Wrapper */}
                  <div className={`w-10 h-10 rounded-2xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center text-gray-800 shadow-sm transition-transform duration-300 hover:rotate-6`}>
                    <IconComponent size={18} className={stat.color} />
                  </div>
                  
                  {/* Number */}
                  <span className={`text-2xl sm:text-3xl font-heading font-extrabold tracking-tight mt-3 ${stat.color}`}>
                    <CountUp target={stat.target} suffix={stat.suffix} />
                  </span>

                  {/* Label */}
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1.5">
                    {stat.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
