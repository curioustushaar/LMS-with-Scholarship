'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiCheckSquare,
  FiAward,
  FiFileText,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiShield,
} from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
  { name: 'Students', icon: FiUsers, path: '/admin/students' },
  { 
    name: 'Courses & Content', 
    icon: FiBookOpen, 
    path: '/admin/courses',
    subItems: [
      { name: 'All Courses', path: '/admin/courses' },
      { name: 'Videos', path: '/admin/courses/videos' },
    ]
  },
  { 
    name: 'Tasks & Projects', 
    icon: FiCheckSquare, 
    path: '/admin/tasks',
    subItems: [
      { name: 'Tasks', path: '/admin/tasks' },
      { name: 'Submissions', path: '/admin/tasks/submissions' },
      { name: 'Projects', path: '/admin/projects' },
    ]
  },
  { name: 'Badges', icon: FiAward, path: '/admin/badges' },
  { name: 'Certificates', icon: FiFileText, path: '/admin/certificates' },
  { name: 'Support Tickets', icon: FiMessageSquare, path: '/admin/support' },
  { name: 'Reports / Analytics', icon: FiBarChart2, path: '/admin/reports' },
  { name: 'Settings', icon: FiSettings, path: '/admin/settings' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isSuperadmin, setIsSuperadmin] = useState(false)

  useEffect(() => {
    checkSuperadminRole()
  }, [])

  const checkSuperadminRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        // Use regular supabase client - RLS policies allow users to read their own profile
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error fetching role:', error)
          return
        }
        
        console.log('Sidebar - User role detected:', data?.role)
        
        if (data?.role === 'superadmin') {
          console.log('✅ Superadmin detected - showing button')
          setIsSuperadmin(true)
        } else {
          console.log('❌ Not superadmin - role is:', data?.role)
        }
      }
    } catch (error) {
      console.error('Error checking superadmin role:', error)
    }
  }

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  const isActive = (path: string) => pathname === path

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
        <div className="p-6 border-b border-gray-700">
          <img src="/logo.png" alt="Gravity Logo" className="h-9 w-auto object-contain mb-2 bg-white/95 p-1 rounded-lg" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] bg-clip-text text-transparent">
            LMS ADMIN
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Learning Management System</p>
        </div>

        {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="text-xl" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {expandedItems.includes(item.name) ? (
                      <FiChevronDown className="text-sm" />
                    ) : (
                      <FiChevronRight className="text-sm" />
                    )}
                  </button>
                  {expandedItems.includes(item.name) && (
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-medium shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <item.icon className="text-xl" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Superadmin Panel Link */}
      {isSuperadmin && (
        <div className="px-3 pb-4">
          <Link
            href="/superadmin"
            onClick={onClose}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg transition-all"
          >
            <FiShield className="text-xl" />
            <span className="text-sm font-medium">Superadmin Panel</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2026 LMS Admin</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
    </>
  )
}
