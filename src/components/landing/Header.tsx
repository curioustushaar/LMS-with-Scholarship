'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Shield, GraduationCap, Briefcase } from 'lucide-react'

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
  { name: 'Training', href: '#training' },
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
              // Convert routes to hash anchors if on home page
              const hash = item.href === '/' ? '#home' : item.href.startsWith('/') ? `#${item.href.substring(1)}` : item.href
              return {
                id: item.id,
                name: item.name,
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
        const sections = navLinks.map((link) => link.href.replace(/^#/, ''))
        for (const section of sections.reverse()) {
          const el = document.getElementById(section)
          if (el && window.scrollY >= el.offsetTop - 140) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  const getLinkHref = (linkHref: string) => {
    if (isHomePage) {
      return linkHref.startsWith('#') ? linkHref : `#${linkHref.replace(/^\//, '')}`
    }
    // If on a subpage, navigate to root with anchor or dedicated route
    return linkHref.startsWith('#') ? `/${linkHref}` : linkHref
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
          <div className="flex justify-between items-center h-12">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF] shadow-md shadow-[#FF2D8D]/20 transition-transform group-hover:scale-105">
                <span className="text-white font-heading font-extrabold text-lg select-none">A</span>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF2D8D] animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-heading font-extrabold text-base tracking-wider leading-none">
                  AAGAJ
                </span>
                <span className="text-[#9C27FF] font-sans font-bold text-[10px] tracking-widest leading-none mt-1">
                  INFOTECH
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const sectionId = link.href.replace(/^#/, '').replace(/^\//, '')
                const isActive = isHomePage && activeSection === sectionId

                return (
                  <Link
                    key={link.name}
                    href={getLinkHref(link.href)}
                    className="relative px-2.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
              <Link href={getLinkHref('#courses')}>
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

                        <Link 
                          href="/login" 
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
                        </Link>

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

                        <Link 
                          href="/superadmin/login" 
                          onClick={() => setShowLoginDropdown(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 transition-colors group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C81E4E] flex items-center justify-center shrink-0">
                            <Shield size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 group-hover:text-[#C81E4E] transition-colors leading-tight">Super Admin Panel</span>
                            <span className="text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Full platform & CMS control</span>
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
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-all focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm xl:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-gray-100 flex flex-col xl:hidden"
            >
              <div className="p-6 flex justify-between items-center border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF]">
                    <span className="text-white font-heading font-extrabold text-sm">A</span>
                  </div>
                  <span className="text-gray-900 font-heading font-extrabold text-sm tracking-wider">AAGAJ</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={getLinkHref(link.href)}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-pink-50/50 hover:text-[#FF2D8D] transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-gray-50 space-y-3">
                <Link href={getLinkHref('#courses')} onClick={() => setIsOpen(false)} className="block w-full">
                  <button className="w-full py-3 border border-[#FF2D8D]/30 hover:border-[#FF2D8D]/80 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 transition-all flex items-center justify-center gap-2">
                    Explore Platform
                  </button>
                </Link>
                
                <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full">
                  <button className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                    Login to LMS
                    <ArrowRight size={15} />
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
