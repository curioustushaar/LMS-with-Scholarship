'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.warn('No session found, redirecting to login')
          if (typeof window !== 'undefined') window.location.replace('/login')
          return
        }

        console.log('Admin layout: Verifying RBAC with server for user:', session.user.id)

        // Strict Server-Side RBAC Verification
        const verifyRes = await fetch('/api/auth/verify-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        const verifyData = await verifyRes.json()

        if (!verifyRes.ok || !verifyData.allowed) {
          console.warn('⛔ RBAC Access Denied in AdminLayout:', verifyData.error)
          await supabase.auth.signOut()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            window.location.replace('/login')
          }
          return
        }

        if (isMounted) {
          console.log('✅ Admin verified successfully by server RBAC')
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Exception in checkAdmin:', err)
        if (typeof window !== 'undefined') window.location.replace('/login')
      }
    }

    checkAdmin()

    // BFCache restoration handler for browser Back/Forward navigation
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        checkAdmin()
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', handlePageShow)
    }

    // Set up periodic check for account status & RBAC (every 60 seconds)
    const intervalId = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const verifyRes = await fetch('/api/auth/verify-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        const verifyData = await verifyRes.json()

        if (!verifyRes.ok || !verifyData.allowed) {
          console.warn('⛔ Account revoked or not admin during periodic check')
          alert(verifyData.error || 'Your admin session has ended or account is suspended.')
          await supabase.auth.signOut()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            window.location.replace('/login')
          }
        }
      } catch (err) {
        console.error('Error checking account status:', err)
      }
    }, 60000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
      if (typeof window !== 'undefined') {
        window.removeEventListener('pageshow', handlePageShow)
      }
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
