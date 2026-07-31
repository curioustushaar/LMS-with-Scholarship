'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen, Video, FileText, Download, HelpCircle, 
  LineChart, Award, UserPlus, GraduationCap, Briefcase, 
  Layout, School, TrendingUp, Bell, Users, ShieldCheck 
} from 'lucide-react'

const featuresData = [
  { title: 'Smart Courses', desc: 'Syllabus, modules, and content', icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-50' },
  { title: 'Video Lessons', desc: 'High definition pre-recorded content', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' },
  { title: 'Assignments & Projects', desc: 'Upload documents and submit codes', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'PDF Notes & Resources', desc: 'Lecture slides & reference ebooks', icon: Download, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { title: 'Quizzes & Assessments', desc: 'Mock tests & timed examinations', icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  { title: 'Progress Tracking', desc: 'View grades and attendance history', icon: LineChart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { title: 'Certificates & Badges', desc: 'Verified block-chain credentials', icon: Award, color: 'text-rose-500', bg: 'bg-rose-50' },
  { title: 'Admission Management', desc: 'Intake workflows and applications', icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { title: 'Scholarship Management', desc: 'Merit list and fee concessions', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-pink-50' },
  { title: 'Internship Portal', desc: 'Real-world projects & apply filters', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50' },
  { title: 'Employer Dashboard', desc: 'Talent pools and posting portals', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'School Partner Management', desc: 'Collab matrices & credit transfer', icon: School, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { title: 'Analytics & Reports', desc: 'Visual dashboards & logs', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
  { title: 'Notifications & Alerts', desc: 'SMS, Email, and Push templates', icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { title: 'Role Management', desc: 'Granular permissions configuration', icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
  { title: 'Secure Auth & Audit Logs', desc: 'SAML, MFA, and access tracking', icon: ShieldCheck, color: 'text-cyan-500', bg: 'bg-cyan-50' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-white overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-[30%] -right-40 w-96 h-96 rounded-full bg-[#9C27FF]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] -left-40 w-96 h-96 rounded-full bg-[#FF2D8D]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-3"
          >
            Everything You Need
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight"
          >
            One Platform. <span className="text-gradient">Unlimited Possibilities.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-gray-500 mt-4 max-w-xl mx-auto font-normal leading-relaxed"
          >
            Powerful modules designed to simplify learning, administration and career growth.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {featuresData.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02, 
                  y: -4, 
                  borderColor: 'rgba(255, 45, 141, 0.2)',
                  boxShadow: '0 12px 25px -10px rgba(156, 39, 255, 0.08)'
                }}
                className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 hover:bg-white"
              >
                {/* Icon wrapper */}
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={18} className={feature.color} />
                </div>
                {/* Text content */}
                <div className="flex flex-col min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}
