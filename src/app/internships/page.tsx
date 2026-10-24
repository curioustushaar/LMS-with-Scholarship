'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { ArrowRight, Video } from 'lucide-react'

export default function InternshipsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/training')
  }, [router])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      <Header />
      <div className="pt-40 pb-20 px-4 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF2D8D]/20 to-[#9C27FF]/20 text-[#FF2D8D] flex items-center justify-center mx-auto">
          <Video size={28} />
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-gray-900">
          Workshops & Hands-on Training
        </h1>
        <p className="text-xs text-gray-500">
          Internships have been upgraded to Live Industry Workshops & Training Sessions. Redirecting...
        </p>
        <div>
          <Link
            href="/training"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md"
          >
            Explore Live Workshops
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
