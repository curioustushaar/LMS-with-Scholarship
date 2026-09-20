'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import SchoolSidebar from '@/components/school/SchoolSidebar'
import { supabase } from '@/lib/supabase'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import { FiMenu, FiBell, FiShield, FiKey, FiLock, FiCheck } from 'react-icons/fi'

export default function SchoolPortalLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [schoolData, setSchoolData] = useState<any>(null)

  // Force Password Change on First Login Modal State
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const isLoginPage = pathname === '/school-portal/login'

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    const checkSchoolAuth = async () => {
      try {
        const token = await getSchoolClientAuthToken()

        if (!token) {
          if (typeof window !== 'undefined') window.location.replace('/school-portal/login')
          return
        }

        const res = await fetch('/api/school/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (!data.success || !data.school) {
          console.warn('Unauthorized school portal access')
          if (typeof window !== 'undefined') window.location.replace('/school-portal/login')
          return
        }

        setSchoolData(data.school)

        if (data.school.is_first_login) {
          setShowFirstLoginModal(true)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('School auth check error:', err)
        if (typeof window !== 'undefined') window.location.replace('/school-portal/login')
      }
    }

    checkSchoolAuth()

    // BFCache restoration handler for browser Back/Forward navigation
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        checkSchoolAuth()
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', handlePageShow)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pageshow', handlePageShow)
      }
    }
  }, [pathname, isLoginPage, router])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')

    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }

    setPwLoading(true)
    try {
      const token = await getSchoolClientAuthToken()
      const res = await fetch('/api/school/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setShowFirstLoginModal(false)
      } else {
        setPwError(data.error || 'Failed to update password')
      }
    } catch (err: any) {
      setPwError(err.message || 'Error updating password')
    } finally {
      setPwLoading(false)
    }
  }

  if (isLoading && !isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#FF2D8D] mx-auto"></div>
          <p className="text-gray-600 font-medium text-sm">Verifying school partner session...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SchoolSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        schoolName={schoolData?.name}
        schoolId={schoolData?.school_id}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              <FiMenu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-gray-800">{schoolData?.name || 'School Partner Portal'}</h2>
              <p className="text-[10px] text-gray-400 font-mono">{schoolData?.school_id} • {schoolData?.city}, {schoolData?.state}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold">
              <FiShield size={11} /> Verified Partner
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      {/* Force Change Temporary Password Modal */}
      {showFirstLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiKey size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Set Permanent Password</h3>
              <p className="text-xs text-gray-500 mt-1">
                For security reasons, you must change your temporary password on your first login before proceeding.
              </p>
            </div>

            {pwError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
                {pwError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {pwLoading ? 'Securing Account...' : 'Set Password & Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
