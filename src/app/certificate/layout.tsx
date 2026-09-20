import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Certificate Verification | GRAVITY',
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

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
