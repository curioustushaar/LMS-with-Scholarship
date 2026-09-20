import type { Metadata } from 'next'
import SuperadminLayoutClient from './SuperadminLayoutClient'

export const metadata: Metadata = {
  title: 'Superadmin Portal | GRAVITY',
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
