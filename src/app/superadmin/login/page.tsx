'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  FiShield,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiLayers,
  FiAward,
  FiCpu,
  FiActivity,
} from 'react-icons/fi'

export default function SuperadminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
          setError(authError.message || 'Invalid superadmin credentials.')
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
    <div className="min-h-screen bg-[#070913] text-white flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-[#FF2D8D] selection:text-white py-6 sm:py-10">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#FF2D8D]/20 to-[#9C27FF]/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-gradient-to-br from-indigo-600/15 via-[#9C27FF]/15 to-transparent rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-5xl w-full bg-[#0E1326]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(255,45,141,0.25)] overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 my-auto"
      >
        {/* Left Side: Brand Authority & Security Showcase (5 cols on lg, compact header on mobile) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#120B24] via-[#161233] to-[#0A0D1F] p-4 sm:p-6 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          {/* Internal Glow Bubble */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#FF2D8D]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#9C27FF]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="space-y-3 sm:space-y-4 relative z-10">
            <div className="flex flex-wrap items-center justify-between lg:flex-col lg:items-start gap-3">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#FF2D8D] to-[#9C27FF] flex items-center justify-center shadow-lg shadow-[#FF2D8D]/30 group-hover:scale-105 transition-transform shrink-0">
                  <FiShield className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <span className="font-extrabold text-sm sm:text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-purple-200">
                    AAGAJ INFOTECH
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-bold tracking-widest text-[#FF2D8D] uppercase">
                    Superadmin Command Hub
                  </span>
                </div>
              </Link>

              <div className="lg:pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Security Node • Tier 4 RBAC
                </span>
              </div>
            </div>
          </div>

          {/* Center Graphic & Governance Highlights (Visible on Desktop / Large Tablets) */}
          <div className="hidden lg:block my-8 space-y-4 relative z-10">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-2">
                <FiCpu className="text-[#FF2D8D]" /> Centralized Platform Controls
              </div>
              <ul className="text-xs text-gray-300 space-y-2.5">
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={14} />
                  <span>National Scholarship Lifecycle & Allocations</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={14} />
                  <span>District Physical Exam Centers & Logistics</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={14} />
                  <span>Partner Schools & Institutional Grants</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={14} />
                  <span>Real-time Financials & Merit Evaluations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Left Footer: Security Note (Desktop) */}
          <div className="hidden lg:flex pt-4 border-t border-white/10 items-center justify-between text-[11px] text-gray-400 relative z-10">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <FiLock className="text-[#FF2D8D]" /> 256-Bit SSL Encrypted
            </span>
            <span className="text-gray-500 font-mono text-[10px]">v2.6 Enterprise</span>
          </div>
        </div>

        {/* Right Side: Authentication Console (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-center relative bg-gradient-to-b from-[#0E1326] to-[#0A0D1F]">
          <div className="max-w-md w-full mx-auto space-y-5 sm:space-y-6">
            {/* Form Title & Context */}
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Superadmin Access</span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-[#FF2D8D]/20 text-[#FF2D8D] border border-[#FF2D8D]/30 uppercase">
                    Root
                  </span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Provide authorized superadmin credentials to authenticate and manage national portal operations.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-start gap-2.5 text-xs text-red-300"
              >
                <FiAlertCircle className="text-red-400 text-base shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{error}</div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
              {/* Email Input */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-300">
                  Superadmin Email ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@aagajinfotech.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF2D8D]/40 focus:border-[#FF2D8D] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-300">
                    Master Password
                  </label>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono">Privileged Auth</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF2D8D]/40 focus:border-[#FF2D8D] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-gradient-to-r from-[#FF2D8D] via-[#D81B60] to-[#9C27FF] hover:opacity-95 shadow-lg shadow-[#FF2D8D]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group mt-2 sm:mt-3 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating Root Node...</span>
                  </span>
                ) : (
                  <>
                    <span>Enter Superadmin Portal</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Nav Links */}
            <div className="pt-3.5 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs">
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 py-1"
              >
                ← Regular Admin Login
              </Link>
              <Link
                href="/school-portal/login"
                className="text-pink-400 hover:text-pink-300 transition-colors font-semibold py-1"
              >
                School Partner Portal ➔
              </Link>
            </div>

            {/* Mobile Footer Security Note */}
            <div className="lg:hidden pt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <FiLock className="text-[#FF2D8D]" /> 256-Bit Encrypted
              </span>
              <span>v2.6 Enterprise</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

