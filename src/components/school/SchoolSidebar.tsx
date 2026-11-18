'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FiHome,
  FiAward,
  FiUsers,
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiUser,
  FiLogOut,
  FiX,
  FiBookOpen,
  FiVideo,
  FiMessageSquare,
  FiFolder,
} from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

interface SchoolSidebarProps {
  isOpen: boolean
  onClose: () => void
  schoolName?: string
  schoolId?: string
  institutionType?: string
}

export default function SchoolSidebar({ isOpen, onClose, schoolName = 'Institutional Partner', schoolId = 'SCH000101', institutionType }: SchoolSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isCoaching = institutionType === 'coaching' || schoolId?.startsWith('CCH')

  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/school-portal/dashboard' },
    { name: 'Scholarships', icon: FiAward, path: '/school-portal/scholarships' },
    { name: 'Registered Students', icon: FiUsers, path: '/school-portal/students' },
    { name: 'Course Videos', icon: FiBookOpen, path: '/school-portal/courses/videos' },
    { name: 'Tasks & Assignments', icon: FiCheckSquare, path: '/school-portal/tasks' },
    { name: 'Projects', icon: FiFolder, path: '/school-portal/projects' },
    { name: 'Certificates', icon: FiAward, path: '/school-portal/certificates' },
    { name: 'Support Tickets', icon: FiMessageSquare, path: '/school-portal/support' },
    { name: 'Workshops & Training', icon: FiVideo, path: '/school-portal/workshops' },
    { name: 'Exam Results', icon: FiCheckSquare, path: '/school-portal/results' },
    { name: 'Incentives & Earnings', icon: FiDollarSign, path: '/school-portal/incentives' },
    { name: 'Download Reports', icon: FiFileText, path: '/school-portal/reports' },
    { name: isCoaching ? 'Coaching Profile & KYC' : 'School Profile & KYC', icon: FiUser, path: '/school-portal/profile' },
  ]

  const handleLogout = async () => {
    if (confirm(`Are you sure you want to sign out of the ${isCoaching ? 'Coaching' : 'School'} Portal?`)) {
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
        window.location.replace('/school-portal/login')
      }
    }
  }

  const isActive = (path: string) => {
    if (path === '/school-portal/dashboard') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-0 w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white flex flex-col h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
        >
          <FiX className="text-2xl" />
        </button>

        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Gravity Logo" className="h-8 w-auto object-contain bg-white/95 p-1 rounded-lg shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">
                {isCoaching ? 'Coaching Portal' : 'School Portal'}
              </span>
              <h1 className="text-sm font-bold text-white truncate max-w-[140px]" title={schoolName}>
                {schoolName}
              </h1>
              <span className="text-[10px] font-mono text-gray-400">{schoolId}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md shadow-[#FF2D8D]/20'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="text-base shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User / Sign Out Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <FiLogOut className="text-base" />
            <span>Sign Out</span>
          </button>
          <div className="text-[10px] text-gray-500 text-center">
            School Partner Hub • v1.0
          </div>
        </div>
      </div>
    </>
  )
}
