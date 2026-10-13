import type { Metadata } from 'next'
import SuperadminLayoutClient from './SuperadminLayoutClient'

export const metadata: Metadata = {
  title: 'Superadmin Portal | GRAVITY',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <SuperadminLayoutClient>{children}</SuperadminLayoutClient>
}
