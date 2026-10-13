'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FiHome,
  FiUserCheck,
  FiBarChart2,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiShield,
  FiBookOpen,
  FiLayout,
  FiFileText,
  FiBriefcase,
  FiDollarSign,
  FiUsers,
  FiMapPin,
  FiTarget,
  FiMail,
  FiMenu,
  FiUserPlus,
  FiAward,
  FiLogOut,
  FiBell,
} from 'react-icons/fi'

interface SuperadminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  name: string
  icon: any
  path: string
  subItems?: MenuItem[]
  dividerBefore?: boolean
  sectionLabel?: string
}

const menuItems: MenuItem[] = [
  // ── Overview ──
  { name: 'Dashboard', icon: FiHome, path: '/superadmin' },
  { name: 'Manage Admins', icon: FiUserCheck, path: '/superadmin/admins' },
  { name: 'Analytics', icon: FiBarChart2, path: '/superadmin/analytics' },
  { name: 'Payment & Revenue', icon: FiDollarSign, path: '/superadmin/payments' },

  // ── Website & Content ──
  { name: 'Website CMS', icon: FiLayout, path: '/superadmin/website', dividerBefore: true, sectionLabel: 'Website & Content' },
  { name: 'Navbar Control', icon: FiMenu, path: '/superadmin/navbar' },

  // ── Modules Management ──
  { name: 'Courses', icon: FiBookOpen, path: '/superadmin/courses', dividerBefore: true, sectionLabel: 'Modules' },
  { name: 'Admissions', icon: FiUserPlus, path: '/superadmin/admissions' },
  { name: 'Internships', icon: FiBriefcase, path: '/superadmin/internships' },
  { name: 'Scholarships', icon: FiAward, path: '/superadmin/scholarships' },
  {
    name: 'School / Coaching Tie-up',
    icon: FiMapPin,
    path: '/superadmin/schools',
    subItems: [
      { name: 'All Partners (Schools & Coaching)', icon: FiMapPin, path: '/superadmin/schools' },
      { name: 'Incentives & Payouts', icon: FiDollarSign, path: '/superadmin/schools/incentives' },
      { name: 'Tie-up Analytics', icon: FiBarChart2, path: '/superadmin/schools/analytics' },
    ],
  },
  { name: 'Employers', icon: FiUsers, path: '/superadmin/employers' },
  { name: 'Website Partners', icon: FiMapPin, path: '/superadmin/school-partners' },
  { name: 'Notices & Circulars', icon: FiBell, path: '/superadmin/notices' },

  // ── Platform Management ──
  { name: 'Contact Messages', icon: FiMail, path: '/superadmin/contact-messages', dividerBefore: true, sectionLabel: 'Platform' },
  { name: 'Settings', icon: FiSettings, path: '/superadmin/settings' },
]

export default function SuperadminSidebar({ isOpen, onClose }: SuperadminSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  const isActive = (path: string) => {
    if (path === '/superadmin') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-0
        w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
        >
          <FiX className="text-2xl" />
        </button>

        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-700/60">
          <div>
            <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-[#C81E4E] via-[#E11D48] to-[#F43F5E] bg-clip-text text-transparent">
              SUPERADMIN
            </h1>
            <p className="text-xs font-medium text-gray-400 mt-1 tracking-wide">
              System Control Panel
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-3">
            {menuItems.map((item) => (
              <li key={item.name}>
                {/* Section Divider & Label */}
                {item.dividerBefore && (
                  <div className="pt-4 pb-2 mt-2 border-t border-gray-700/50">
                    {item.sectionLabel && (
                      <span className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {item.sectionLabel}
                      </span>
                    )}
                  </div>
                )}

                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="text-lg" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      {expandedItems.includes(item.name) ? (
                        <FiChevronDown className="text-sm" />
                      ) : (
                        <FiChevronRight className="text-sm" />
                      )}
                    </button>
                    {expandedItems.includes(item.name) && item.subItems && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              href={subItem.path}
                              onClick={onClose}
                              className={`block px-4 py-2 rounded-lg text-sm transition-all ${
                                isActive(subItem.path)
                                  ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-medium'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-medium shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin Portal Access & Logout */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            href="/admin/dashboard"
            className="block w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-center text-xs font-semibold transition-colors"
          >
            Switch to Admin Portal
          </Link>

          <button
            type="button"
            onClick={async () => {
              if (confirm('Are you sure you want to sign out of Superadmin?')) {
                try {
                  await supabase.auth.signOut()
                } catch (e) {
                  // ignore
                }
                if (typeof window !== 'undefined') {
                  localStorage.clear()
                  sessionStorage.clear()
                  document.cookie.split(';').forEach((c) => {
                    document.cookie = c
                      .replace(/^ +/, '')
                      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
                  })
                  window.location.replace('/superadmin/login')
                }
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold transition-all"
          >
            <FiLogOut className="text-sm" />
            Sign Out Superadmin
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700/60">
          <div className="text-[11px] text-gray-500 text-center">
            <p>© 2026 LMS Superadmin</p>
            <p className="mt-0.5">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
