'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.warn('No session found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('Admin layout: Checking role for user:', session.user.id)

        // Try to verify admin role from database using supabaseAdmin (bypasses RLS)
        const { data: userData, error } = await supabaseAdmin
          .from('profiles')
          .select('role, account_status')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching user profile:', error)
          // If RLS is blocking, check auth metadata as fallback
          const authRole = session.user.app_metadata?.role || session.user.user_metadata?.role
          if (authRole === 'admin') {
            console.log('Using auth metadata role: admin')
            setIsLoading(false)
            return
          }
          router.push('/login')
          return
        }

        if (!userData || userData.role !== 'admin') {
          console.warn('Unauthorized access to admin portal. Role:', userData?.role)
          router.push('/login')
          return
        }

        console.log('✅ Admin verified successfully')
        setIsLoading(false)
      } catch (err) {
        console.error('Exception in checkAdmin:', err)
        router.push('/login')
      }
    }

    checkAdmin()
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
