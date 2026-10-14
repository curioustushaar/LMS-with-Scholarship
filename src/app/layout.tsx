import './globals.css'
import type { Metadata } from 'next'


export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL('https://aagajfoundation.in'),
  title: {
    default: 'GRAVITY | AAGAJ Foundation',
    template: '%s | GRAVITY',
  },
  description: 'GRAVITY by AAGAJ Foundation is a complete learning ecosystem connecting students, schools, employers, and scholarships through modern interactive technology.',
  keywords: [
    'GRAVITY',
    'AAGAJ Foundation',
    'GRAVITY LMS',
    'Scholarships',
    'Courses',
    'Admissions',
    'Internships',
    'School Partners',
    'Training Programs',
    'Education India',
  ],
  authors: [{ name: 'AAGAJ Foundation', url: 'https://aagajfoundation.in' }],
  publisher: 'AAGAJ Foundation',
  alternates: {
    canonical: 'https://aagajfoundation.in',
  },
  openGraph: {
    title: 'GRAVITY | AAGAJ Foundation',
    description: 'Empowering Education. Elevating Careers. GRAVITY by AAGAJ Foundation connects students, schools, employers, and scholarships.',
    url: 'https://aagajfoundation.in',
    siteName: 'GRAVITY',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://aagajfoundation.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GRAVITY by AAGAJ Foundation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GRAVITY | AAGAJ Foundation',
    description: 'Empowering Education. Elevating Careers. GRAVITY by AAGAJ Foundation connects students, schools, employers, and scholarships.',
    images: ['https://aagajfoundation.in/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://aagajfoundation.in/#organization',
      'name': 'GRAVITY',
      'alternateName': 'GRAVITY by AAGAJ Foundation',
      'url': 'https://aagajfoundation.in',
      'logo': 'https://aagajfoundation.in/logo.png',
      'image': 'https://aagajfoundation.in/og-image.png',
      'description': 'GRAVITY by AAGAJ Foundation is an integrated education, scholarship, admissions, internship, and career learning platform.',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Bhupatipur Road, Near Krishi Anusandhan Kendra',
        'addressLocality': 'Patna',
        'addressRegion': 'Bihar',
        'postalCode': '800020',
        'addressCountry': 'IN',
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-9431430464',
        'contactType': 'customer service',
        'email': 'aagajfoundationpaliganj@gmail.com',
        'areaServed': 'IN',
        'availableLanguage': ['en', 'hi'],
      },
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'AAGAJ Foundation',
        'url': 'https://aagajfoundation.in',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://aagajfoundation.in/#website',
      'url': 'https://aagajfoundation.in',
      'name': 'GRAVITY',
      'alternateName': 'GRAVITY by AAGAJ Foundation',
      'description': 'Empowering Education. Elevating Careers.',
      'publisher': {
        '@id': 'https://aagajfoundation.in/#organization',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white font-sans text-gray-900 antialiased selection:bg-[#FF2D8D]/20 selection:text-[#FF2D8D]">
        {children}
      </body>
    </html>
  )
}
