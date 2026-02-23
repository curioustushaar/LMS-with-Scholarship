'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('Attempting login with:', formData.email)
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      
      if (!authData.session) {
        throw new Error('No session received from authentication')
      }

      console.log('✅ Login successful, auth data:', {
        user: authData.user?.email,
        hasSession: !!authData.session,
        tokenLength: authData.session.access_token.length
      })

      // Get current session to verify persistence
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('⚠️ Session not persisted, storing token manually')
        localStorage.setItem('supabase.auth.token', authData.session.access_token)
      }

      // Check user role from database
      console.log('Checking role for user ID:', authData.user.id)
      
      // Fetch role from profiles table
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()

      // Final Role Determination
      const role = userData?.role || authData.user.app_metadata?.role || authData.user.user_metadata?.role || 'student'
      
      console.log('Final Role determined:', role)

      // SECURITY: Only allow admin and student roles on this login page
      // Superadmin must use /superadmin/login
      if (role === 'superadmin') {
        console.warn('⚠️ Superadmin trying to login via admin page')
        await supabase.auth.signOut()
        throw new Error('Access denied. Please use the Superadmin login portal.')
      }

      if (role === 'admin') {
        console.log('✅ Admin verified, redirecting to dashboard')
        router.push('/admin/dashboard')
      } else {
        console.log('✅ Student verified, redirecting to portal')
        router.push('/student/videos')
      }
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-[#C81E4E] to-[#D91E5B] p-8 md:p-12 flex flex-col justify-center items-center text-white">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-wider">LMS ADMIN</h1>
              <p className="text-base md:text-lg opacity-90">LEARNING MANAGEMENT MADE SIMPLE</p>
            </div>
            
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 md:mb-8">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full border-4 border-white/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl mb-4">🎓</div>
                  <p className="text-sm font-medium">Admin Portal</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm opacity-90">Manage all your LMS operations efficiently</p>
              <p className="text-sm opacity-90">Focus on growing your education platform with ease</p>
            </div>

            <div className="mt-8 flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Secure Login</span>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-6 md:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-sm md:text-base text-gray-600">Sign in to access admin dashboard</p>
              </div>

              {/* Admin Login Only */}
              <div className="mb-6 md:mb-8 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg p-3">
                <p className="text-white font-semibold text-sm text-center">🔐 Admin Access Only</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400 text-xl" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                      placeholder="admin@lms.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400 text-xl" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-gray-400 text-xl hover:text-[#C81E4E]" />
                      ) : (
                        <FiEye className="text-gray-400 text-xl hover:text-[#C81E4E]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-[#C81E4E] border-gray-300 rounded focus:ring-[#C81E4E]"
                    />
                    <span className="ml-2 text-gray-700 text-sm">Remember me</span>
                  </label>
                  <a href="#" className="text-[#C81E4E] hover:text-[#D91E5B] text-sm font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-bold py-3 px-6 rounded-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <span className="ml-2">→</span>}
                </button>
              </form>

              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-gray-600">Protected by enterprise-grade security</p>
                <a 
                  href="/superadmin/login" 
                  className="text-xs text-gray-400 hover:text-purple-600 transition-colors inline-block"
                >
                  Superadmin Access →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
