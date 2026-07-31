'use client'

import { motion } from 'framer-motion'
import { 
  UserPlus, FileCheck, CheckSquare, BookOpen, PenTool, 
  LineChart, Award, Briefcase, Rocket 
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Register',
    desc: 'Create your account',
    icon: UserPlus,
    color: 'text-pink-500 bg-pink-50 border-pink-100',
  },
  {
    number: '02',
    title: 'Admission',
    desc: 'Get admitted into programs',
    icon: FileCheck,
    color: 'text-purple-500 bg-purple-50 border-purple-100',
  },
  {
    number: '03',
    title: 'Enroll',
    desc: 'Choose courses you love',
    icon: CheckSquare,
    color: 'text-blue-500 bg-blue-50 border-blue-100',
  },
  {
    number: '04',
    title: 'Learn',
    desc: 'Access content anytime',
    icon: BookOpen,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  },
  {
    number: '05',
    title: 'Assess',
    desc: 'Complete quizzes & tasks',
    icon: PenTool,
    color: 'text-amber-500 bg-amber-50 border-amber-100',
  },
  {
    number: '06',
    title: 'Track',
    desc: 'Monitor your progress',
    icon: LineChart,
    color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
  },
  {
    number: '07',
    title: 'Certify',
    desc: 'Earn verified credentials',
    icon: Award,
    color: 'text-rose-500 bg-rose-50 border-rose-100',
  },
  {
    number: '08',
    title: 'Internship',
    desc: 'Gain real-world experience',
    icon: Briefcase,
    color: 'text-cyan-500 bg-cyan-50 border-cyan-100',
  },
  {
    number: '09',
    title: 'Placement',
    desc: 'Get placed in top companies',
    icon: Rocket,
    color: 'text-red-500 bg-red-50 border-red-100',
  },
]

export default function Journey() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#FF2D8D]/2 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-3">
            Ecosystem Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
            Student <span className="text-gradient">Journey</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-4 max-w-xl mx-auto font-normal leading-relaxed">
            A seamless, structured pipeline designed to guide students from account setup to secure, high-paying corporate placements.
          </p>
        </div>

        {/* Desktop Horizontal Timeline (LG and up) */}
        <div className="hidden lg:block relative py-12">
          {/* Main connecting line */}
          <div className="absolute top-[80px] left-[5%] right-[5%] h-0.5 bg-gray-100" />
          
          {/* Active indicator overlay line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '90%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute top-[80px] left-[5%] h-0.5 bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-cyan-400"
          />

          <div className="grid grid-cols-9 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center group relative"
                >
                  {/* Step counter */}
                  <span className="text-[10px] font-extrabold text-gray-300 font-heading mb-3 group-hover:text-[#FF2D8D] transition-colors">
                    {step.number}
                  </span>

                  {/* Icon Circle */}
                  <div className={`w-12 h-12 rounded-full border ${step.color} flex items-center justify-center relative z-10 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon size={18} />
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xs font-bold text-gray-900 mt-5 leading-tight group-hover:text-[#FF2D8D] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed px-1">
                    {step.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile & Tablet Vertical Timeline (MD and below) */}
        <div className="lg:hidden relative pl-8 sm:pl-12 max-w-md mx-auto space-y-8 py-2">
          {/* Vertical Connecting Line */}
          <div className="absolute top-0 bottom-0 left-4 sm:left-6 w-0.5 bg-gray-100" />
          
          {/* Animated vertical overlay */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute top-0 left-4 sm:left-6 w-0.5 bg-gradient-to-b from-[#FF2D8D] via-[#9C27FF] to-cyan-400"
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative flex gap-4 items-start group"
              >
                {/* Steps Counter */}
                <span className="absolute -left-[44px] sm:-left-[54px] top-3 text-[10px] font-extrabold text-gray-400 w-5 text-right font-heading">
                  {step.number}
                </span>

                {/* Icon Circle */}
                <div className={`w-8 h-8 rounded-full border ${step.color} flex items-center justify-center relative z-10 shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={14} />
                </div>

                {/* Content */}
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-gray-900 leading-none mt-1 group-hover:text-[#FF2D8D] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
