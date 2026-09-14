'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Trophy, Briefcase, Award, Flame, Zap, CheckCircle2, ChevronRight, Activity, Calendar, Play } from 'lucide-react'

// Avatar images from Unsplash
const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
]

// Floating cards animation configuration
const floatAnimation = (delay: number) => ({
  y: [0, -12, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
    delay: delay,
  }
})

export default function Hero() {
  const [heroContent, setHeroContent] = useState({
    badge_text: '#1 Intelligent LMS Platform',
    heading_line1: 'Empowering Education.',
    heading_line2: 'Elevating Careers.',
    heading_line3: 'Transforming Futures.',
    description:
      'AAGAJ INFOTECH LMS is a complete learning ecosystem that connects Students, Institutions, Employers & Opportunities through intelligent technology and seamless experiences.',
    cta_primary_text: 'Explore Courses',
    cta_primary_link: '#courses',
    cta_secondary_text: 'Apply Admission',
    cta_secondary_link: '#admissions',
    social_proof_text: 'Trusted by 1000+ Students across 25+ Institutions',
  })

  useEffect(() => {
    fetch('/api/public/site-content?section=home_hero')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          setHeroContent((prev) => ({ ...prev, ...data.data }))
        }
      })
      .catch((err) => console.error(err))
  }, [])
  return (
    <section id="home" className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-24 lg:pb-20 overflow-hidden bg-white">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/4 -left-36 w-96 h-96 rounded-full bg-[#FF2D8D]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-[#9C27FF]/5 blur-[150px] pointer-events-none" />
      
      {/* Small floating spheres/nodes for premium vibe */}
      <motion.div 
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 right-[45%] w-4 h-4 rounded-full bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF] opacity-30 blur-[1px] hidden lg:block"
      />
      <motion.div 
        animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-24 left-[10%] w-6 h-6 rounded-full bg-[#9C27FF]/20 opacity-40 blur-[2px] hidden lg:block"
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[60%] right-[10%] w-5 h-5 rounded-full bg-[#FF2D8D]/20 opacity-30 blur-[2px] hidden lg:block"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-4 sm:space-y-5 lg:space-y-6 relative">
            
            {/* 3D Animated Background behind the Left text / Badge */}
            <div className="absolute -left-16 -top-20 w-80 h-80 pointer-events-none select-none overflow-visible hidden sm:block opacity-65 z-0">
              {/* Rotating Ring 1 (Spins horizontally left-to-right) */}
              <motion.div
                animate={{ rotateY: [0, 360], rotateX: 65, rotateZ: 25 }}
                transition={{
                  rotateY: { duration: 18, repeat: Infinity, ease: "linear" }
                }}
                className="absolute inset-0 rounded-full border border-dashed border-[#FF2D8D]/20"
                style={{ transformStyle: 'preserve-3d' }}
              />
              {/* Rotating Ring 2 (Spins horizontally right-to-left) */}
              <motion.div
                animate={{ rotateY: [0, -360], rotateX: 35, rotateZ: 75 }}
                transition={{
                  rotateY: { duration: 12, repeat: Infinity, ease: "linear" }
                }}
                className="absolute inset-6 rounded-full border border-[#9C27FF]/15"
                style={{ transformStyle: 'preserve-3d' }}
              />
              {/* Rotating Ring 3 (Spins vertically / tilted) */}
              <motion.div
                animate={{ rotateX: [0, 360], rotateY: 45, rotateZ: 45 }}
                transition={{
                  rotateX: { duration: 25, repeat: Infinity, ease: "linear" }
                }}
                className="absolute inset-12 rounded-full border border-[#FF2D8D]/10"
                style={{ transformStyle: 'preserve-3d' }}
              />
              {/* Glowing Central 3D Sphere */}
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-[#FF2D8D]/10 to-[#9C27FF]/10 blur-xl border border-white/10"
              />
            </div>
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2D8D]/8 border border-[#FF2D8D]/10 text-xs font-semibold text-[#FF2D8D] tracking-wide"
            >
              <Zap size={12} className="fill-[#FF2D8D]" />
              {heroContent.badge_text || '#1 Intelligent LMS Platform'}
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[50px] font-heading font-extrabold text-gray-900 tracking-tight leading-[1.12]"
            >
              {heroContent.heading_line1 || 'Empowering Education.'}<br />
              <span className="text-[#FF2D8D]">{heroContent.heading_line2 || 'Elevating Careers.'}</span><br />
              <span className="text-gradient">{heroContent.heading_line3 || 'Transforming Futures.'}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-gray-500 max-w-xl font-normal leading-relaxed"
            >
              {heroContent.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 w-full sm:w-auto"
            >
              <Link href={heroContent.cta_primary_link || '#courses'} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-semibold text-sm rounded-full shadow-md shadow-[#FF2D8D]/15 hover:shadow-lg hover:shadow-[#FF2D8D]/25 transition-all flex items-center justify-center gap-2"
                >
                  {heroContent.cta_primary_text || 'Explore Courses'}
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href={heroContent.cta_secondary_link || '#admissions'} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 border border-[#FF2D8D]/30 hover:border-[#FF2D8D] text-[#FF2D8D] font-semibold text-sm rounded-full bg-white/40 hover:bg-[#FF2D8D]/5 transition-all flex items-center justify-center gap-2"
                >
                  {heroContent.cta_secondary_text || 'Apply Admission'}
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 pt-4 border-t border-gray-100 w-full"
            >
              {/* Stacked avatars */}
              <div className="flex -space-x-2.5">
                {avatars.map((url, i) => (
                  <div key={i} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-sm">
                    <img
                      src={url}
                      alt={`Student avatar ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                {/* 5 Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                  Trusted by <span className="text-gray-900 font-bold">1000+ Students</span> across <span className="text-[#FF2D8D] font-semibold">25+ Institutions</span>
                </p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: 3D Laptop Mockup & Floating Cards */}
          <div className="lg:col-span-7 relative flex justify-center items-center mt-8 lg:mt-0">
            
            {/* The Laptop Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[580px] z-10 px-4"
            >
              {/* Laptop Screen Frame */}
              <div className="relative rounded-2xl bg-[#0F172A] p-2 sm:p-2.5 shadow-2xl border border-gray-800/80">
                {/* Webcam dot */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-700 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-blue-500/80" />
                </div>
                
                {/* Simulated Screen Dashboard (Dark/Vibrant theme) */}
                <div className="aspect-[16/10] w-full rounded-lg bg-[#0F172A] overflow-hidden text-gray-300 font-sans text-[9px] sm:text-[10px] md:text-[11px] select-none flex">
                  
                  {/* Dashboard Sidebar */}
                  <div className="w-[20%] border-r border-gray-800/80 bg-[#0A0F1D] p-1.5 sm:p-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Logo icon inside mock dashboard */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="w-4 h-4 rounded-md bg-[#FF2D8D] flex items-center justify-center">
                          <span className="text-[8px] text-white font-extrabold font-heading">A</span>
                        </div>
                        <span className="font-heading font-extrabold text-[8px] tracking-wider text-white hidden sm:inline">AAGAJ</span>
                      </div>
                      
                      {/* Sidebar Items */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-[#FF2D8D]/10 text-white font-medium">
                          <Activity size={10} className="text-[#FF2D8D]" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </div>
                        {['My Courses', 'Assignments', 'Certificates', 'Calendar', 'Analytics', 'Settings'].map((item, index) => (
                          <div key={index} className="flex items-center gap-1.5 px-1.5 py-1 text-gray-500 hover:text-gray-300">
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-700" />
                            <span className="hidden sm:inline">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* User profile mock at bottom */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800/80">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF]" />
                      <span className="text-[7px] text-gray-400 font-medium hidden sm:inline">Aanya Sharma</span>
                    </div>
                  </div>

                  {/* Dashboard Main Content */}
                  <div className="flex-1 bg-[#0F172A] p-2.5 sm:p-4 flex flex-col gap-2.5 sm:gap-4 overflow-y-auto">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-bold font-heading text-xs sm:text-sm">Hello, Aanya 👋</h3>
                        <p className="text-[8px] sm:text-[9px] text-gray-500">Welcome back to your learning ecosystem.</p>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-gray-800 text-[8px] font-semibold text-[#9C27FF]">
                        Premium Student
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {[
                        { label: 'Courses Enrolled', val: '12', color: 'text-blue-400' },
                        { label: 'Assignments', val: '08', color: 'text-[#FF2D8D]' },
                        { label: 'Certificates', val: '05', color: 'text-amber-400' },
                        { label: 'Hours Tracked', val: '120', color: 'text-[#9C27FF]' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-[#1E293B]/40 rounded p-1.5 border border-gray-800/50 flex flex-col">
                          <span className="text-[6px] text-gray-500 uppercase font-semibold">{stat.label}</span>
                          <span className={`text-xs sm:text-sm font-bold mt-0.5 ${stat.color}`}>{stat.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chart Panel & Info Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* Chart Area */}
                      <div className="md:col-span-2 bg-[#1E293B]/40 rounded p-2 border border-gray-800/50 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] text-white font-bold">Course Progress</span>
                          <span className="text-[7px] text-[#FF2D8D] font-bold">78% Average</span>
                        </div>
                        {/* Simulated Graph */}
                        <div className="h-16 w-full relative flex items-end">
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FF2D8D" stopOpacity="0.2"/>
                                <stop offset="100%" stopColor="#FF2D8D" stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#334155" strokeWidth="0.2" strokeDasharray="2,2"/>
                            <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeWidth="0.2" strokeDasharray="2,2"/>
                            <line x1="0" y1="30" x2="100" y2="30" stroke="#334155" strokeWidth="0.2" strokeDasharray="2,2"/>
                            {/* Area */}
                            <path d="M 0 35 Q 20 15 40 25 T 80 5 T 100 15 L 100 40 L 0 40 Z" fill="url(#chartGrad)"/>
                            {/* Line */}
                            <path d="M 0 35 Q 20 15 40 25 T 80 5 T 100 15" fill="none" stroke="url(#lineGrad)" strokeWidth="1.5"/>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#FF2D8D"/>
                              <stop offset="100%" stopColor="#9C27FF"/>
                            </linearGradient>
                            {/* Glowing dots */}
                            <circle cx="40" cy="25" r="1.5" fill="#FF2D8D"/>
                            <circle cx="80" cy="5" r="1.5" fill="#9C27FF"/>
                          </svg>
                        </div>
                      </div>

                      {/* Right Widgets: Schedule */}
                      <div className="bg-[#1E293B]/40 rounded p-2 border border-gray-800/50 flex flex-col justify-between">
                        <span className="text-[7px] text-gray-500 font-bold uppercase">Upcoming Class</span>
                        <div className="my-1.5">
                          <h4 className="text-white font-semibold text-[8px] leading-tight">UI/UX Design Principles</h4>
                          <span className="text-[6px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={6} /> Today 5:30 PM
                          </span>
                        </div>
                        <button className="w-full py-1 rounded bg-[#FF2D8D] text-white font-bold text-[7px] hover:bg-[#FF2D8D]/90 transition-colors">
                          Join Class
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              {/* Laptop Bezel Base */}
              <div className="relative w-[112%] -left-[6%] h-3 bg-[#E2E8F0] rounded-b-xl border-t border-gray-300 shadow-lg flex items-center justify-center">
                {/* Center opening notch */}
                <div className="w-16 h-1 bg-gray-400 rounded-b-md" />
              </div>
              {/* Thin stand lip */}
              <div className="w-[70%] h-1 bg-gray-400/50 mx-auto blur-[1px]" />
            </motion.div>

            {/* FLOATING CARD 1: Scholarship Available (Top Right) */}
            <motion.div
              animate={floatAnimation(0.2)}
              className="absolute -top-4 right-0 sm:right-4 z-20 max-w-[150px] sm:max-w-[170px] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#F2F2F2] shadow-xl shadow-gray-100/50 flex items-center gap-2"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 shadow-sm border border-amber-100">
                <Trophy size={15} className="fill-amber-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight truncate">Scholarship Available</span>
                <span className="text-[8px] sm:text-[9px] text-[#FF2D8D] font-semibold mt-0.5">3 schemes eligible</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 2: Internship Opportunity (Right side) */}
            <motion.div
              animate={floatAnimation(1.2)}
              className="absolute top-1/3 -right-2 sm:-right-4 z-20 max-w-[150px] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#F2F2F2] shadow-xl shadow-gray-100/50 hidden sm:flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <Briefcase size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-900 truncate">Frontend Developer</span>
                  <span className="text-[8px] text-gray-400 truncate">TechVerve Solutions</span>
                </div>
              </div>
              <button className="w-full py-1 text-center bg-[#FF2D8D] hover:bg-[#FF2D8D]/90 text-white font-bold text-[8px] rounded-lg transition-colors shadow-sm">
                Apply Now
              </button>
            </motion.div>

            {/* FLOATING CARD 3: Top Performer (Bottom Left) */}
            <motion.div
              animate={floatAnimation(2.2)}
              className="absolute -bottom-4 left-0 sm:left-2 z-20 max-w-[150px] sm:max-w-[180px] bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-[#F2F2F2] shadow-xl shadow-gray-100/50 flex items-center gap-2"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-gray-100 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Aanya profile photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[9px] text-[#9C27FF] font-bold tracking-wider uppercase leading-none">Top Performer</span>
                <span className="text-[11px] sm:text-xs font-bold text-gray-900 mt-0.5 truncate">Aanya Sharma</span>
                <span className="text-[8px] text-gray-400">B.Tech • 9.8 GPA</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 4: Learning Streak (Bottom Middle) */}
            <motion.div
              animate={floatAnimation(0.8)}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 max-w-[120px] bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-[#F2F2F2] shadow-xl shadow-gray-100/50 hidden xs:flex sm:flex items-center gap-2"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <Flame size={14} className="fill-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-extrabold text-gray-900 leading-none">12 Days</span>
                <span className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">Streak Active</span>
              </div>
            </motion.div>

            {/* FLOATING CARD 5: Certificates Earned (Bottom Right) */}
            <motion.div
              animate={floatAnimation(1.7)}
              className="absolute -bottom-4 right-0 sm:right-0 z-20 max-w-[130px] sm:max-w-[140px] bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-[#F2F2F2] shadow-xl shadow-gray-100/50 flex items-center gap-2"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                <Award size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-extrabold text-gray-900 leading-none">05</span>
                <span className="text-[8px] text-gray-400 mt-0.5 whitespace-nowrap">Certificates</span>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  )
}
