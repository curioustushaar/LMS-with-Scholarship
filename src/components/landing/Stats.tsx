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

  return (
    <span ref={elementRef}>
      {count}
      {suffix}
    </span>
  )
}

const defaultStatsData = [
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
  const [stats, setStats] = useState(defaultStatsData)

  useEffect(() => {
    fetch('/api/public/site-content?section=home_stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          const cms = data.data
          setStats([
            {
              id: 1,
              target: parseInt(cms.stat_1_value) || 1000,
              suffix: cms.stat_1_suffix || '+',
              label: cms.stat_1_label || 'Students',
              icon: Users,
              color: 'text-[#FF2D8D]',
              bgColor: 'bg-[#FF2D8D]/5',
              borderColor: 'border-[#FF2D8D]/10',
            },
            {
              id: 2,
              target: parseInt(cms.stat_2_value) || 75,
              suffix: cms.stat_2_suffix || '+',
              label: cms.stat_2_label || 'Courses',
              icon: GraduationCap,
              color: 'text-[#9C27FF]',
              bgColor: 'bg-[#9C27FF]/5',
              borderColor: 'border-[#9C27FF]/10',
            },
            {
              id: 3,
              target: parseInt(cms.stat_3_value) || 100,
              suffix: cms.stat_3_suffix || '+',
              label: cms.stat_3_label || 'Internships',
              icon: Briefcase,
              color: 'text-[#FF2D8D]',
              bgColor: 'bg-[#FF2D8D]/5',
              borderColor: 'border-[#FF2D8D]/10',
            },
            {
              id: 4,
              target: parseInt(cms.stat_4_value) || 40,
              suffix: cms.stat_4_suffix || '+',
              label: cms.stat_4_label || 'Partner Schools',
              icon: School,
              color: 'text-[#9C27FF]',
              bgColor: 'bg-[#9C27FF]/5',
              borderColor: 'border-[#9C27FF]/10',
            },
            {
              id: 5,
              target: parseInt(cms.stat_5_value) || 35,
              suffix: cms.stat_5_suffix || '+',
              label: cms.stat_5_label || 'Scholarships',
              icon: Award,
              color: 'text-[#FF2D8D]',
              bgColor: 'bg-[#FF2D8D]/5',
              borderColor: 'border-[#FF2D8D]/10',
            },
            {
              id: 6,
              target: parseInt(cms.stat_6_value) || 50,
              suffix: cms.stat_6_suffix || '+',
              label: cms.stat_6_label || 'Hiring Companies',
              icon: Building2,
              color: 'text-[#9C27FF]',
              bgColor: 'bg-[#9C27FF]/5',
              borderColor: 'border-[#9C27FF]/10',
            },
          ])
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section className="relative py-12 bg-white overflow-hidden border-y border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl p-4 sm:p-5 border ${stat.borderColor} ${stat.bgColor} backdrop-blur-sm transition-all duration-300 flex flex-col items-center text-center group`}
              >
                {/* Floating subtle ambient dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${stat.color} absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity`}
                />

                {/* Icon wrapper */}
                <div
                  className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={20} />
                </div>

                {/* Counter value */}
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                  <CountUp target={stat.target} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <p className="text-xs sm:text-[13px] font-semibold text-gray-600 tracking-wide mt-1">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
