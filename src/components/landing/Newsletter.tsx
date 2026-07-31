'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <section id="contact" className="relative py-24 bg-white overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-[#9C27FF]/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#FF2D8D]/2 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Newsletter card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 rounded-[32px] bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF] p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between shadow-xl shadow-pink-500/10 min-h-[300px]"
          >
            {/* Ambient bubble elements in card */}
            <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-black/10 blur-2xl" />

            <div className="space-y-4 max-w-md relative z-10 text-white">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
                Stay Updated with<br />AAGAJ INFOTECH
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed">
                Subscribe to our newsletter for the latest updates on trending courses, scholarship criteria, and placement opportunity calendars.
              </p>

              {/* Form */}
              <form onSubmit={handleSubscribe} className="flex gap-2 pt-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/60 flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-black/90 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shrink-0"
                >
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                  <Send size={12} />
                </button>
              </form>
            </div>

            {/* Right: Floating Vector CSS/SVG Envelope */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 8, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-32 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 relative shadow-2xl flex items-center justify-center p-3"
              >
                {/* Simulated Envelope flaps */}
                <div className="absolute top-0 inset-x-0 h-10 border-b border-white/25 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl" />
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <Mail size={18} />
                </div>
                <div className="absolute bottom-2 right-2 text-xs">✨</div>
                <div className="absolute top-2 left-2 text-xs">⭐</div>
              </motion.div>
            </div>

          </motion.div>

          {/* Right Column: Let's Connect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-4 bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-heading font-extrabold text-gray-900 leading-tight">
                Let&apos;s Connect
              </h3>
              <p className="text-xs text-gray-500 font-normal leading-relaxed">
                We are here to help and answer any questions you may have. Get in touch with our team today.
              </p>
            </div>

            {/* Details list */}
            <div className="space-y-4 my-6">
              <div className="flex gap-3 items-start text-xs font-semibold text-gray-600">
                <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#FF2D8D] shrink-0">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase leading-none">Office</span>
                  <span className="mt-1 text-gray-800">New Delhi, India</span>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs font-semibold text-gray-600">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#9C27FF] shrink-0">
                  <Mail size={14} />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase leading-none">Email</span>
                  <a href="mailto:aagajfoundationpaliganj@gmail.com" className="mt-1 text-gray-800 hover:text-[#FF2D8D] transition-colors break-all">
                    aagajfoundationpaliganj@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs font-semibold text-gray-600">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                  <Phone size={14} />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase leading-none">Phone</span>
                  <a href="tel:+919608369002" className="mt-1 text-gray-800 hover:text-[#FF2D8D] transition-colors">
                    +91 9608369002
                  </a>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              {[
                { icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>, color: 'text-blue-600 hover:bg-blue-50 hover:border-blue-200' },
                { icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, color: 'text-sky-500 hover:bg-sky-50 hover:border-sky-200' },
                { icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>, color: 'text-blue-700 hover:bg-blue-50 hover:border-blue-200' },
                { icon: <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, color: 'text-pink-600 hover:bg-pink-50 hover:border-pink-200' },
                { icon: <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163c-.274-1.03-.108-1.838-2.113-2.113C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.385.5c-1.03.275-1.838 1.083-2.113 2.113C0 8.07 0 12 0 12s0 3.93.502 5.837c.274 1.03.108 1.838 2.113 2.113 1.885.5 9.385.5 9.385.5s7.5 0 9.385-.5c1.03-.275 1.838-1.083 2.113-2.113.502-1.907.502-5.837.502-5.837s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, color: 'text-red-600 hover:bg-red-50 hover:border-red-200' },
              ].map((social, i) => {
                return (
                  <a
                    key={i}
                    href="#"
                    className={`w-8 h-8 rounded-xl border border-gray-100 bg-white flex items-center justify-center transition-all ${social.color}`}
                  >
                    {social.icon}
                  </a>
                )
              })}
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
