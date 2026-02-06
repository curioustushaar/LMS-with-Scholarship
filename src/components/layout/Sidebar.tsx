'use client'

import { useState } from 'react'
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
} from 'react-icons/fi'

const menuItems = [
  { name: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
  { name: 'Students', icon: FiUsers, path: '/admin/students' },
  { 
    name: 'Courses & Content', 
    icon: FiBookOpen, 
    path: '/admin/courses',
    subItems: [
      { name: 'All Courses', path: '/admin/courses' },
      { name: 'Weeks', path: '/admin/courses/weeks' },
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

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] bg-clip-text text-transparent">
          LMS ADMIN
        </h1>
        <p className="text-xs text-gray-400 mt-1">Learning Management System</p>
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

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2026 LMS Admin</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
