'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiVideo, FiArrowRight } from 'react-icons/fi'

export default function SuperadminInternshipsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/superadmin/trainings')
  }, [router])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF2D8D]/20 to-[#9C27FF]/20 text-[#FF2D8D] flex items-center justify-center">
        <FiVideo size={30} />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900">Internships Replaced with Workshops & Training</h2>
      <p className="text-xs text-gray-500 max-w-md">
        Redirecting you to the new Workshops & Training management panel...
      </p>
      <Link
        href="/superadmin/trainings"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md"
      >
        Go to Workshops & Training
        <FiArrowRight size={14} />
      </Link>
    </div>
  )
}
