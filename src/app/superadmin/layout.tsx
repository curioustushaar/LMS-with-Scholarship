'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Skip authentication check for login page
  const isLoginPage = pathname === '/superadmin/login'

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    const checkSuperadmin = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.warn('No active session found, redirecting to superadmin login')
          router.push('/superadmin/login')
          return
        }

        // Verify superadmin role from database
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('role, account_status')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching user profile:', error)
          router.push('/superadmin/login')
          return
        }

        if (!userData || userData.role !== 'superadmin') {
          console.warn('Unauthorized access to superadmin portal. Role:', userData?.role)
          await supabase.auth.signOut()
          router.push('/superadmin/login')
          return
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Exception in checkSuperadmin:', err)
        router.push('/superadmin/login')
      }
    }

    checkSuperadmin()
  }, [router, isLoginPage])

  // Show loading spinner only when not on login page and still checking auth
  if (isLoading && !isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying superadmin access...</p>
        </div>
      </div>
    )
  }

  // Login page - no sidebar/topbar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Authenticated pages - with sidebar and topbar
  return (
    <div className="flex h-screen bg-gray-50">
      <SuperadminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
