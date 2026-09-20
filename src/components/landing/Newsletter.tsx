'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, CheckCircle2, MessageSquare } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  // Contact form state
  const [contactData, setContactData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: '',
    category: 'general',
  })
  const [submittingContact, setSubmittingContact] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingContact(true)
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      })
      const data = await res.json()
      if (data.success) {
        setContactSuccess(true)
        setContactData({
          sender_name: '',
          sender_email: '',
          subject: '',
          message: '',
          category: 'general',
        })
        setTimeout(() => setContactSuccess(false), 6000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingContact(false)
    }
  }

  return (
    <section id="contact" className="relative py-24 bg-white overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-[#9C27FF]/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#FF2D8D]/2 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Contact Form & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-[0.2em] block mb-2">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 tracking-tight leading-tight">
                Let&apos;s Build Your <span className="text-gradient">Career Future</span> Together
              </h2>
              <p className="text-sm text-gray-500 mt-3 font-normal leading-relaxed">
                Have questions about course syllabus, admissions, scholarships, or enterprise partnerships? Reach out directly.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#FF2D8D] flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Registered Office</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-normal">
                    Bhupatipur Road, Near Krishi Anusandhan Kendra, Patna - 800020, Bihar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#9C27FF] flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Email Inquiries</h4>
                  <a href="mailto:aagajfoundationpaliganj@gmail.com" className="text-xs text-gray-500 hover:text-[#FF2D8D] transition-colors break-all mt-0.5 block">
                    aagajfoundationpaliganj@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Phone Support</h4>
                  <a href="tel:+919608369002" className="text-xs text-gray-500 hover:text-[#FF2D8D] transition-colors mt-0.5 block">
                    +91 9608369002
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xl shadow-pink-500/5">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Send us a Message</h3>
            <p className="text-xs text-gray-500 mb-6">Our academic counselors and partnership directors respond within 24 hours.</p>

            {contactSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fadeIn">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-emerald-700">Thank you for reaching out. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      value={contactData.sender_name}
                      onChange={(e) => setContactData({ ...contactData, sender_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={contactData.sender_email}
                      onChange={(e) => setContactData({ ...contactData, sender_email: e.target.value })}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Inquiry Category</label>
                    <select
                      value={contactData.category}
                      onChange={(e) => setContactData({ ...contactData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="admission">Admissions &amp; Intake</option>
                      <option value="course">Course Details</option>
                      <option value="scholarship">Scholarship Assistance</option>
                      <option value="internship">Internships &amp; Placement</option>
                      <option value="employer">Employer / Hiring Partnership</option>
                      <option value="partnership">School / College Alliance</option>
                      <option value="training">Corporate Training</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactData.subject}
                    onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                    placeholder="Enter message subject"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingContact}
                  className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  {submittingContact ? 'Sending Message...' : 'Send Message Now'}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Newsletter banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[32px] bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF] p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between shadow-xl shadow-pink-500/10"
        >
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-black/10 blur-2xl" />

          <div className="space-y-2 max-w-md relative z-10 text-white">
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
              Stay Updated with<br />GRAVITY
            </h3>
            <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed">
              Subscribe to get notified of new admissions, internship openings, and scholarship dead-lines.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto relative z-10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/60 min-w-[220px]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-white text-[#FF2D8D] text-xs font-extrabold hover:bg-gray-50 transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
              <Send size={12} />
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  )
}
