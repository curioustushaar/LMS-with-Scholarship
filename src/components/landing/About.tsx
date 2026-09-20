'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, Target, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'

export default function About() {
  const [content, setContent] = useState({
    title: 'About Gravity',
    subtitle: 'Empowering the next generation of learners & innovators',
    description:
      'Gravity is a forward-thinking EdTech ecosystem dedicated to transforming the educational landscape. We bridge the gap between academic theory and industry reality through our comprehensive Learning Management System.',
    mission:
      'To democratize quality education by providing an accessible, technology-driven platform that connects students with world-class mentors, courses, internships, and scholarships.',
    vision:
      "To become India's most trusted learning ecosystem where every student earns verified skills, builds portfolio projects, and secures high-impact careers.",
  })

  useEffect(() => {
    fetch('/api/public/site-content?section=about')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          setContent((prev) => ({ ...prev, ...data.data }))
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <section id="about" className="relative py-24 bg-white overflow-hidden border-t border-gray-50">
      {/* Background Soft Blobs */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-[#FF2D8D]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[#9C27FF]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission, Vision, Values */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2D8D]/8 border border-[#FF2D8D]/10 text-xs font-semibold text-[#FF2D8D]">
              <Sparkles size={12} className="fill-[#FF2D8D]" />
              Who We Are
            </div>

            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight leading-tight">
              Bridging the Gap Between <span className="text-[#FF2D8D]">Classrooms</span> & <span className="text-[#9C27FF]">Careers</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
              {content.description}
            </p>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/50 to-white border border-pink-100/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100/80 text-[#FF2D8D] flex items-center justify-center">
                  <Target size={16} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Our Mission</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{content.mission}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white border border-purple-100/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-[#9C27FF] flex items-center justify-center">
                  <Award size={16} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Our Vision</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{content.vision}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link href="/about">
                <button className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-full shadow-md shadow-pink-500/10 hover:shadow-lg transition-all flex items-center gap-1.5">
                  Learn More About Us
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Visual Infographic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl overflow-hidden border border-gray-800">
              {/* Soft glow blobs inside */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#FF2D8D]/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#9C27FF]/20 blur-3xl" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF] flex items-center justify-center shadow-md">
                      <span className="font-extrabold text-white text-lg">G</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Gravity Core Pillars</h4>
                      <p className="text-[10px] text-gray-400">Integrated SaaS Learning Framework</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-pink-500/10 text-[#FF2D8D] text-xs font-bold border border-pink-500/20">
                    Est. 2024
                  </span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { title: 'Outcome-Driven Curriculum', desc: 'Syllabus designed directly with hiring employers and tech leaders.' },
                    { title: 'Project & Portfolio Mentorship', desc: 'Real production code repositories and evaluated deliverables.' },
                    { title: 'Scholarships & Inclusivity', desc: 'Merit and need-based fee concessions for all deserving candidates.' },
                    { title: 'Guaranteed Placement Pipeline', desc: 'Direct referral access to 100+ partner companies and startups.' },
                  ].map((pillar, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <CheckCircle2 size={16} className="text-[#FF2D8D] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-gray-200">{pillar.title}</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">{pillar.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
