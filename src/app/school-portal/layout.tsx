import type { Metadata } from 'next'
import SchoolPortalLayoutClient from './SchoolPortalLayoutClient'

export const metadata: Metadata = {
  title: 'School Portal | GRAVITY',
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

export default function SchoolPortalLayout({ children }: { children: React.ReactNode }) {
  return <SchoolPortalLayoutClient>{children}</SchoolPortalLayoutClient>
}
