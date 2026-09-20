import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | GRAVITY',
  description: 'Authentication portal for students, partners, and administrators of GRAVITY LMS.',
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

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
