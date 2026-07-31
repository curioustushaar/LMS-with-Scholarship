'use client'

import { motion } from 'framer-motion'

// Stylized corporate logo components using inline SVGs/CSS
const MicrosoftLogo = () => (
  <div className="flex items-center gap-2 select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
      <rect width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" width="10.5" height="10.5" fill="#7FBA00" />
      <rect y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
    <span className="font-sans font-semibold text-sm text-gray-800 tracking-tight">Microsoft</span>
  </div>
)

const GoogleLogo = () => (
  <div className="flex items-center gap-1.5 select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    <span className="font-sans font-semibold text-sm text-gray-800 tracking-tight">Google</span>
  </div>
)

const AWSLogo = () => (
  <div className="flex flex-col items-center select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <div className="flex items-end leading-none">
      <span className="font-sans font-black text-base text-gray-800 tracking-tight">aws</span>
    </div>
    {/* Curved orange arrow */}
    <svg className="w-8 h-1.5 -mt-0.5" viewBox="0 0 40 8" fill="none">
      <path d="M2 2 Q 20 8 38 2" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M35 1.5 L38 2 L36.5 5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  </div>
)

const DeloitteLogo = () => (
  <div className="flex items-baseline select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <span className="font-sans font-black text-sm text-gray-800 tracking-tighter">Deloitte</span>
    <span className="w-1.5 h-1.5 rounded-full bg-[#86BC25] ml-0.5 inline-block" />
  </div>
)

const InfosysLogo = () => (
  <div className="flex items-center select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <span className="font-sans font-bold italic text-base text-blue-700 tracking-tighter">Infosys</span>
  </div>
)

const WiproLogo = () => (
  <div className="flex items-center gap-1 select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <div className="relative w-4 h-4 rounded-full border-[1.5px] border-purple-500 flex items-center justify-center">
      <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-pink-500 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-[#9C27FF]" />
      </div>
    </div>
    <span className="font-sans font-extrabold text-sm text-gray-800 lowercase tracking-tighter">wipro</span>
  </div>
)

const TCSLogo = () => (
  <div className="flex items-baseline select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <span className="font-sans font-black text-sm text-[#0066B3] italic tracking-tight">tcs</span>
  </div>
)

const TataLogo = () => (
  <div className="flex items-center select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <span className="font-sans font-black text-sm text-gray-800 tracking-wider">TATA</span>
  </div>
)

const AccentureLogo = () => (
  <div className="flex items-center select-none grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
    <span className="font-sans font-bold text-sm text-gray-800 tracking-tighter flex items-center">
      accenture
      <span className="text-[#A100FF] font-black text-base ml-0.5 leading-none">&gt;</span>
    </span>
  </div>
)

const logos = [
  MicrosoftLogo,
  GoogleLogo,
  AWSLogo,
  DeloitteLogo,
  InfosysLogo,
  WiproLogo,
  TCSLogo,
  TataLogo,
  AccentureLogo,
]

export default function Marquee() {
  return (
    <section className="py-14 bg-white border-y border-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.22em] block">
          Trusted by Leading Institutions & Companies
        </span>
      </div>

      {/* Infinite marquee train */}
      <div className="relative w-full flex overflow-hidden">
        {/* Shadow Overlays to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Marquee track */}
        <div className="flex gap-20 py-2 items-center animate-marquee whitespace-nowrap min-w-full">
          {/* Logo set 1 */}
          {logos.map((Logo, index) => (
            <div key={`set1-${index}`} className="flex-shrink-0">
              <Logo />
            </div>
          ))}
          {/* Logo set 2 (duplicate for seamless loop) */}
          {logos.map((Logo, index) => (
            <div key={`set2-${index}`} className="flex-shrink-0">
              <Logo />
            </div>
          ))}
          {/* Logo set 3 (extra padding for large screen widths) */}
          {logos.map((Logo, index) => (
            <div key={`set3-${index}`} className="flex-shrink-0">
              <Logo />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
