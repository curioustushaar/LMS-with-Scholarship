'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiBookOpen, FiArrowRight, FiShield, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

export default function SchoolPortalLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const cleanIdentifier = identifier.trim()
      if (!cleanIdentifier || !password) {
        throw new Error('Please enter both your School Email/ID and Password.')
      }

      // Step 1: Call School Login API to verify credentials & establish authenticated session
      const prepRes = await fetch('/api/school/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: password,
        }),
      })

      const prepData = await prepRes.json()

      if (!prepRes.ok || !prepData.success) {
        throw new Error(prepData.error || 'Invalid school credentials or school account not found.')
      }

      // Step 2: Store session token in localStorage
      const activeToken = prepData.token
      if (typeof window !== 'undefined' && activeToken) {
        localStorage.setItem('school_token', activeToken)
        localStorage.setItem('supabase.auth.token', activeToken)
      }

      // Step 3: Clean transition to school dashboard
      window.location.href = '/school-portal/dashboard'
    } catch (err: any) {
      console.error('School login error:', err)
      setError(err.message || 'An unexpected error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl mb-4 shadow-xl">
            <img src="/logo.png" alt="Gravity Logo" className="h-10 w-auto object-contain" />
          </div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest block mb-1">
            Institutional Partner Access
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            School & Coaching Portal
          </h1>
          <p className="text-purple-200 text-xs mt-1.5">
            Log in to manage scholarship enrollments, view student results, and track partner incentives
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
              <FiAlertCircle className="text-red-500 text-lg shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official Email or Partner ID (SCH / CCH)
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
                <input
                  type="text"
                  required
                  placeholder="e.g. abcschool@gmail.com, SCH000101, or CCH000101"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2D8D] font-mono text-gray-900"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2D8D] text-gray-900"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#FF2D8D]/25 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Partner Dashboard</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500">
              🔒 Multi-tenant encrypted session. Your data is isolated and protected.
            </p>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center mt-6 flex flex-wrap justify-center items-center gap-3 text-xs text-purple-300">
          <a href="/login" className="hover:text-white transition-colors">
            ← Admin Login
          </a>
          <span>•</span>
          <a href="https://students.aagajfoundation.in/login" className="hover:text-white font-medium transition-colors">
            Student LMS Login
          </a>
          <span>•</span>
          <a href="/scholarships" className="hover:text-white transition-colors">
            Public Scholarship Portal
          </a>
        </div>
      </div>
    </div>
  )
}
