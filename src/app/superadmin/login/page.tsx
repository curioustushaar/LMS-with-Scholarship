'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiShield, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'

export default function SuperadminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (authError) {
        if (authError.message === 'Failed to fetch' || authError.message?.includes('fetch')) {
          setError('Connection Error: Cannot reach Supabase server. Please verify your Supabase environment configuration in .env.')
        } else {
          setError(authError.message || 'Invalid superadmin credentials')
        }
        setLoading(false)
        return
      }

      if (!authData.user || !authData.session) {
        setError('Authentication failed: No active session received from server.')
        setLoading(false)
        return
      }

      // Step 2: Verify superadmin role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError)
        await supabase.auth.signOut()
        setError('Failed to verify superadmin access. Profile record not found.')
        setLoading(false)
        return
      }

      if (profile.role !== 'superadmin') {
        await supabase.auth.signOut()
        setError('Access denied. Superadmin privileges required for this portal.')
        setLoading(false)
        return
      }

      // Store superadmin token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('superadmin_bypass')
        localStorage.setItem('superadmin_token', authData.session.access_token)
        localStorage.setItem('supabase.auth.token', authData.session.access_token)
      }

      // Success - redirect to superadmin dashboard
      console.log('✅ Superadmin authentication verified successfully')
      router.push('/superadmin')
      router.refresh()
    } catch (err: any) {
      console.error('Superadmin login error:', err)
      setError(err.message || 'An unexpected error occurred during login.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full mb-4 shadow-2xl">
            <FiShield className="text-5xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Superadmin Portal
          </h1>
          <p className="text-purple-200 text-sm">
            High Security Access for Platform Administrators
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start">
                  <FiAlertCircle className="text-red-500 text-xl mr-3 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Superadmin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="superadmin@lms.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Access Superadmin Portal'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Protected by 256-bit encrypted Superadmin Role Verification
            </p>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <a
            href="/login"
            className="text-purple-200 hover:text-white text-sm transition-colors"
          >
            ← Back to Regular Login
          </a>
        </div>
      </div>
    </div>
  )
}
