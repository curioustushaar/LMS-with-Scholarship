'use client'

import { useState, useEffect } from 'react'
import { settingsAPI, superadminAPI } from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'
import { FiSearch, FiBell, FiUser, FiLogOut, FiSettings, FiChevronDown, FiMenu } from 'react-icons/fi'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState<any>(null)
  
  // Detect if we're in superadmin context
  const isSuperadmin = pathname?.startsWith('/superadmin')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Use appropriate API based on context
        const res: any = isSuperadmin 
          ? await superadminAPI.getSettings()
          : await settingsAPI.getProfile()
        if (res?.success && mounted) setProfile(res.data)
      } catch (e) {
        console.error('Failed to load profile in Topbar', e)
      }
    })()
    const onProfileUpdated = async (e?: any) => {
      try {
        const res: any = isSuperadmin 
          ? await superadminAPI.getSettings()
          : await settingsAPI.getProfile()
        if (res?.success && mounted) setProfile(res.data)
      } catch (err) {
        console.error('Failed to refresh profile on update event', err)
      }
    }

    // Listen for same-tab custom event
    window.addEventListener('profile:updated', onProfileUpdated)
    // Listen for cross-tab localStorage updates
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'profile-updated') {
        onProfileUpdated()
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      mounted = false
      window.removeEventListener('profile:updated', onProfileUpdated)
      window.removeEventListener('storage', onStorage)
    }
  }, [isSuperadmin])

  const handleLogout = () => {
    router.push(isSuperadmin ? '/superadmin/login' : '/login')
  }
  
  const handleSettings = () => {
    setShowDropdown(false)
    router.push(isSuperadmin ? '/superadmin/settings' : '/admin/settings')
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
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                {profile?.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.profile_image_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold">{(profile?.full_name || 'A').charAt(0)}</div>
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-800">{profile?.full_name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role || 'Admin'}</p>
              </div>
              <FiChevronDown className="text-gray-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    type="button"
                    onClick={handleSettings}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FiUser />
                    <span>My Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSettings}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FiSettings />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    type="button"
                    onClick={() => { setShowDropdown(false); handleLogout() }}
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
