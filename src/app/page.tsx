'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure router is ready
    const timer = setTimeout(() => {
      console.log('Redirecting to login...')
      router.push('/login')
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C81E4E] border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading LMS Admin...</p>
      </div>
    </div>
  )
}
