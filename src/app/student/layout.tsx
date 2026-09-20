import type { Metadata } from 'next'
import StudentLayoutClient from './StudentLayoutClient'

export const metadata: Metadata = {
  title: 'Student Portal | GRAVITY',
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

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>
}
