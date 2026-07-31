import './globals.css'
import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AAGAJ INFOTECH - Empowering Education. Elevating Careers.',
  description: 'AAGAJ INFOTECH LMS is a complete learning ecosystem connecting students, schools, employers, and scholarships through modern interactive technology.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white font-sans text-gray-900 antialiased selection:bg-[#FF2D8D]/20 selection:text-[#FF2D8D]">
        {children}
      </body>
    </html>
  )
}
