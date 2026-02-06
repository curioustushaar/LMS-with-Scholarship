'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiChevronDown, FiMenu } from 'react-icons/fi'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <FiMenu className="text-2xl" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
              placeholder="Search student, ticket, certificate ID..."
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-[#C81E4E] hover:bg-gray-100 rounded-lg transition-all">
            <FiBell className="text-xl lg:text-2xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <FiChevronDown className="text-gray-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <FiUser />
                  <span>My Profile</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <FiSettings />
                  <span>Settings</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
