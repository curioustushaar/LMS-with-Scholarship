'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: FiHome, path: '/superadmin' },
  { name: 'Manage Admins', icon: FiUserCheck, path: '/superadmin/admins' },
  { name: 'Courses', icon: FiBookOpen, path: '/superadmin/courses' },
  { name: 'Analytics', icon: FiBarChart2, path: '/superadmin/analytics' },
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
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C81E4E] to-[#D91E5B] rounded-lg flex items-center justify-center">
              <FiShield className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] bg-clip-text text-transparent">
                SUPERADMIN
              </h1>
              <p className="text-xs text-gray-400">System Control Panel</p>
            </div>
          </div>
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

        {/* Admin Portal Access */}
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/admin/dashboard"
            className="block w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center text-sm font-medium transition-colors"
          >
            Switch to Admin Portal
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            <p>© 2026 LMS Superadmin</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
