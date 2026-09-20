'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
      if (err.message === 'Failed to fetch' || err?.name === 'TypeError' || err.message?.includes('fetch')) {
        setError('Connection Error: Cannot reach Supabase server. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
      } else {
        setError(err.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-[#FF2D8D] to-[#9C27FF] p-8 md:p-12 flex flex-col justify-center items-center text-white relative">
            {/* Top Backlighting bubble */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-black/10 blur-xl pointer-events-none" />

            <div className="text-center mb-4 relative z-10 flex flex-col items-center">
              <img src="/logo.png" alt="Gravity Logo" className="h-20 w-auto mb-3 object-contain" />
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold mb-1 tracking-wider uppercase">
                GRAVITY
              </h1>
              <p className="text-xs md:text-sm font-semibold tracking-wide text-pink-100 uppercase">
                Next-Gen Education Ecosystem
              </p>
            </div>
            
            {/* Animated school boy illustration */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-48 h-48 md:w-56 md:h-56 mb-4 flex items-center justify-center z-10"
            >
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background dashed orbit circle */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="6 4" />
                <motion.circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="2.5" 
                  strokeDasharray="20 180" 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Backpack (backlayer) */}
                <rect x="65" y="85" width="70" height="75" rx="20" fill="#9C27FF" />
                <rect x="75" y="75" width="50" height="15" rx="7" fill="#FF2D8D" />
                
                {/* Straps */}
                <path d="M 75 85 C 75 110, 85 130, 95 130" stroke="#FF2D8D" strokeWidth="6" strokeLinecap="round" />
                <path d="M 125 85 C 125 110, 115 130, 105 130" stroke="#FF2D8D" strokeWidth="6" strokeLinecap="round" />

                {/* Body/Shoulders */}
                <path d="M 60 160 C 60 130, 140 130, 140 160 Z" fill="#F3F4F6" />
                <path d="M 85 130 L 100 145 L 115 130 Z" fill="#E5E7EB" />

                {/* Head */}
                <circle cx="100" cy="90" r="30" fill="#FBCFE8" />

                {/* Hair */}
                <path d="M 70 90 C 70 55, 130 55, 130 90 C 122 75, 78 75, 70 90 Z" fill="#1F2937" />
                
                {/* Cap/Hair tuft */}
                <path d="M 90 60 Q 100 50 110 60 Z" fill="#1F2937" />

                {/* Face Features (Smiling boy) */}
                <circle cx="90" cy="90" r="2.5" fill="#1F2937" />
                <circle cx="110" cy="90" r="2.5" fill="#1F2937" />
                <path d="M 92 102 Q 100 110 108 102" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
                
                {/* Cheek Blush */}
                <circle cx="82" cy="96" r="3.5" fill="#F472B6" fillOpacity="0.8" />
                <circle cx="118" cy="96" r="3.5" fill="#F472B6" fillOpacity="0.8" />

                {/* Cute Floating shapes */}
                <motion.path 
                  d="M165,65 L173,65 L169,57 Z" 
                  fill="#FF2D8D" 
                  animate={{ rotate: 360, y: [0, -5, 0] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.circle 
                  cx="35" 
                  cy="110" 
                  r="4" 
                  fill="#9C27FF" 
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </svg>
            </motion.div>

            <div className="text-center space-y-2 relative z-10 max-w-xs">
              <p className="text-xs text-white/90 leading-relaxed">
                Manage academic courses, track real-time progress statistics, issue certifications, and schedule student internship workflows efficiently.
              </p>
            </div>

            <div className="mt-6 flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full relative z-10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold uppercase tracking-wider">Secure Access</span>
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
              <div className="mb-6 md:mb-8 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] rounded-xl p-3 shadow-md shadow-[#FF2D8D]/10">
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent"
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
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="text-gray-400 text-xl hover:text-[#FF2D8D]" />
                      ) : (
                        <FiEye className="text-gray-400 text-xl hover:text-[#FF2D8D]" />
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
                      className="w-4 h-4 text-[#FF2D8D] border-gray-300 rounded focus:ring-[#FF2D8D]"
                    />
                    <span className="ml-2 text-gray-700 text-sm">Remember me</span>
                  </label>
                  <a href="#" className="text-[#FF2D8D] hover:text-[#9C27FF] text-sm font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#FF2D8D]/15 transform hover:scale-[1.01] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <span className="ml-2">→</span>}
                </button>
              </form>

              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-gray-600">Protected by enterprise-grade security</p>
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <a 
                    href="/school-portal/login" 
                    className="hover:text-emerald-600 font-semibold transition-colors"
                  >
                    School Partner Portal →
                  </a>
                  <span>•</span>
                  <a 
                    href="/superadmin/login" 
                    className="hover:text-[#FF2D8D] transition-colors"
                  >
                    Superadmin Access →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
