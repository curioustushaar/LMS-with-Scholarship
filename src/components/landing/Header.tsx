'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Menu, X, ArrowRight, Shield, GraduationCap, Briefcase, ChevronRight, ChevronDown, Sparkles } from 'lucide-react'

interface NavLinkItem {
  id?: string
  name: string
  href: string
  is_visible?: boolean
}

const defaultNavLinks: NavLinkItem[] = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Courses', href: '#courses' },
  { name: 'Admissions', href: '#admissions' },
  { name: 'Internships', href: '#internships' },
  { name: 'Scholarships', href: '#scholarships' },
  { name: 'Employers', href: '#employers' },
  { name: 'School Partners', href: '#school-partners' },
  { name: 'Notice', href: '#notices' },
  { name: 'Contact', href: '#contact' },
]

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(defaultNavLinks)
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [showLoginDropdown, setShowLoginDropdown] = useState(false)
  const [showMobileLoginOpts, setShowMobileLoginOpts] = useState(false)

  useEffect(() => {
    // Fetch dynamic navbar config
    fetch('/api/public/navbar')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          const links = data.data
            .filter((item: any) => item.is_visible)
            .map((item: any) => {
              // Replace any legacy 'Training' item with 'Notice'
              const isTraining = item.name?.toLowerCase() === 'training' || item.href?.includes('training')
              const name = isTraining ? 'Notice' : item.name
              const rawHref = isTraining ? '#notices' : item.href

              // Convert routes to hash anchors if on home page
              const hash = rawHref === '/' ? '#home' : rawHref.startsWith('/') ? `#${rawHref.substring(1)}` : rawHref
              return {
                id: item.id,
                name: name,
                href: hash,
              }
            })
          setNavLinks(links)
        }
      })
      .catch((err) => console.error('Navbar fetch error:', err))

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      if (isHomePage) {
        const sections = navLinks
          .map((link) => link.href.replace(/^#/, '').replace(/^\//, ''))
          .filter(Boolean)

        const scrollPosition = window.scrollY + 180

        for (const section of sections) {
          const el = document.getElementById(section)
          if (el) {
            const top = el.offsetTop
            const height = el.offsetHeight
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section)
              break
            }
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage, navLinks])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const getLinkHref = (linkHref: string) => {
    if (isHomePage) {
      return linkHref.startsWith('#') ? linkHref : `#${linkHref.replace(/^\//, '')}`
    }
    // If on a subpage, navigate to root with anchor or dedicated route
    return linkHref.startsWith('#') ? `/${linkHref}` : linkHref
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.08,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#F2F2F2]/80 py-2 shadow-sm'
            : 'bg-white/70 backdrop-blur-md py-2.5 border-b border-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-14 sm:h-16">
            
            {/* Logo */}
            <Link 
              href="/" 
              onClick={() => setActiveSection('home')}
              className="flex items-center gap-2 group shrink-0"
            >
              <img
                src="/logo.png"
                alt="GRAVITY by AAGAJ Foundation"
                className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const sectionId = link.href.replace(/^#/, '').replace(/^\//, '')
                const isActive = activeSection === sectionId

                return (
                  <Link
                    key={link.name}
                    href={getLinkHref(link.href)}
                    onClick={() => setActiveSection(sectionId)}
                    className={`relative px-2.5 py-2 text-xs font-semibold transition-colors duration-200 ${
                      isActive ? 'text-[#FF2D8D]' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3 relative">
              <Link href={getLinkHref('#courses')} onClick={() => setActiveSection('courses')}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border border-[#FF2D8D]/30 hover:border-[#FF2D8D]/80 rounded-full text-xs font-semibold text-gray-700 bg-white/50 backdrop-blur-sm transition-all shadow-sm flex items-center gap-1.5"
                >
                  Explore Platform
                </motion.button>
              </Link>
              
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-semibold text-xs rounded-full shadow-md shadow-[#FF2D8D]/15 hover:shadow-lg hover:shadow-[#FF2D8D]/25 transition-all flex items-center gap-1.5"
                >
                  Login
                  <motion.span animate={{ rotate: showLoginDropdown ? 90 : 0 }} className="inline-block">
                    <ArrowRight size={13} />
                  </motion.span>
                </motion.button>

                {/* Dropdown Card */}
                <AnimatePresence>
                  {showLoginDropdown && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setShowLoginDropdown(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-2.5 z-50 flex flex-col gap-1"
                      >
                        <Link 
                          href="/login" 
                          onClick={() => setShowLoginDropdown(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FF2D8D]/5 transition-colors group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#FF2D8D] flex items-center justify-center shrink-0">
                            <Shield size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-[#FF2D8D] transition-colors leading-tight">Login as an Admin</span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Teacher & staff dashboard</span>
                          </div>
                        </Link>

                        <a 
                          href="https://students.aagajfoundation.in/login" 
                          onClick={() => setShowLoginDropdown(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#9C27FF]/5 transition-colors group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#9C27FF] flex items-center justify-center shrink-0">
                            <GraduationCap size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-[#9C27FF] transition-colors leading-tight">Login as a Student</span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Courses, tasks & certificates</span>
                          </div>
                        </a>

                        <Link 
                          href="/school-portal/login" 
                          onClick={() => setShowLoginDropdown(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 transition-colors group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Briefcase size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 transition-colors leading-tight">School Partner Portal</span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Enroll students & view results</span>
                          </div>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Hamburger Button */}
            <div className="xl:hidden flex items-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-gray-700 hover:text-[#FF2D8D] bg-gray-50/80 hover:bg-pink-50/80 border border-gray-100 transition-all focus:outline-none shadow-sm"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} className="text-[#FF2D8D]" /> : <Menu size={22} />}
              </motion.button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Navigation with Background Blur and Half-Screen Side Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with Deep Blur & Soft Dim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => {
                setIsOpen(false)
                setShowMobileLoginOpts(false)
              }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md xl:hidden"
            />

            {/* Half-Screen Floating / Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[78%] sm:w-[320px] max-w-[340px] bg-white/95 backdrop-blur-2xl shadow-[-12px_0_35px_rgba(0,0,0,0.18)] border-l border-white/60 rounded-l-[28px] flex flex-col justify-between overflow-hidden xl:hidden"
            >
              {/* Drawer Top / Header */}
              <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-100/80 bg-gradient-to-r from-pink-50/30 via-white to-purple-50/30">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 group shrink-0" 
                  onClick={() => {
                    setActiveSection('home')
                    setIsOpen(false)
                    setShowMobileLoginOpts(false)
                  }}
                >
                  <img src="/logo.png" alt="Gravity" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
                </Link>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsOpen(false)
                    setShowMobileLoginOpts(false)
                  }}
                  className="w-9 h-9 rounded-full bg-gray-100/80 hover:bg-pink-100/60 text-gray-500 hover:text-[#FF2D8D] flex items-center justify-center transition-all shadow-sm"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Navigation Items List with Staggered Animations */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto py-3 px-3.5 space-y-1 scrollbar-thin scrollbar-thumb-gray-200"
              >
                {navLinks.map((link) => {
                  const sectionId = link.href.replace(/^#/, '').replace(/^\//, '')
                  const isActive = activeSection === sectionId

                  return (
                    <motion.div key={link.name} variants={itemVariants}>
                      <Link
                        href={getLinkHref(link.href)}
                        onClick={() => {
                          setActiveSection(sectionId)
                          setIsOpen(false)
                          setShowMobileLoginOpts(false)
                        }}
                        className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#FF2D8D]/12 via-[#9C27FF]/8 to-transparent text-[#FF2D8D] font-bold shadow-sm'
                            : 'text-gray-700 active:bg-pink-50/50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {isActive ? (
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-sm shadow-[#FF2D8D]/50" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                          )}
                          <span>{link.name}</span>
                        </span>

                        {isActive ? (
                          <ChevronRight size={14} className="text-[#FF2D8D]" />
                        ) : null}
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Drawer Footer / Call To Actions */}
              <div className="p-3.5 sm:p-4 border-t border-gray-100/90 bg-white/80 backdrop-blur-md space-y-2.5">
                {/* Explore Platform CTA */}
                <Link 
                  href={getLinkHref('#courses')} 
                  onClick={() => {
                    setIsOpen(false)
                    setShowMobileLoginOpts(false)
                  }} 
                  className="block w-full"
                >
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-2.5 border border-[#FF2D8D]/35 hover:border-[#FF2D8D] rounded-xl text-xs font-bold text-gray-800 bg-white/90 hover:bg-pink-50/40 transition-all shadow-sm flex items-center justify-center gap-1.5 group"
                  >
                    <Sparkles size={13} className="text-[#FF2D8D] group-hover:rotate-12 transition-transform" />
                    Explore Platform
                  </motion.button>
                </Link>
                
                {/* Login Expandable Box */}
                <div className="w-full space-y-1.5">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowMobileLoginOpts(!showMobileLoginOpts)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-[#7B1FA2] hover:brightness-105 text-white font-bold text-xs rounded-xl shadow-md shadow-[#FF2D8D]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Login to LMS</span>
                    <motion.span 
                      animate={{ rotate: showMobileLoginOpts ? 180 : 0 }} 
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                  </motion.button>

                  {/* Expandable Role Options for Mobile */}
                  <AnimatePresence>
                    {showMobileLoginOpts && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden flex flex-col gap-1 pt-1"
                      >
                        <Link
                          href="/login"
                          onClick={() => {
                            setIsOpen(false)
                            setShowMobileLoginOpts(false)
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-pink-50/60 hover:bg-pink-50 text-gray-800 transition-colors group text-left"
                        >
                          <div className="w-6 h-6 rounded-md bg-[#FF2D8D] text-white flex items-center justify-center shrink-0">
                            <Shield size={12} />
                          </div>
                          <span className="text-[11px] font-bold group-hover:text-[#FF2D8D] transition-colors">Admin Portal</span>
                        </Link>

                        <a
                          href="https://students.aagajfoundation.in/login"
                          onClick={() => {
                            setIsOpen(false)
                            setShowMobileLoginOpts(false)
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-purple-50/60 hover:bg-purple-50 text-gray-800 transition-colors group text-left"
                        >
                          <div className="w-6 h-6 rounded-md bg-[#9C27FF] text-white flex items-center justify-center shrink-0">
                            <GraduationCap size={12} />
                          </div>
                          <span className="text-[11px] font-bold group-hover:text-[#9C27FF] transition-colors">Student Portal</span>
                        </a>

                        <Link
                          href="/school-portal/login"
                          onClick={() => {
                            setIsOpen(false)
                            setShowMobileLoginOpts(false)
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-50 text-gray-800 transition-colors group text-left"
                        >
                          <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Briefcase size={12} />
                          </div>
                          <span className="text-[11px] font-bold group-hover:text-emerald-700 transition-colors">School Partner Portal</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
