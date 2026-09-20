import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | GRAVITY',
  description: 'Connect with the GRAVITY academic and support team at AAGAJ Foundation for course admissions, scholarships, employer drives, or institutional partnerships.',
  alternates: {
    canonical: 'https://aagajfoundation.in/contact',
  },
  openGraph: {
    title: 'Contact Us | GRAVITY',
    description: 'Connect with the GRAVITY support and academic team at AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/contact',
    siteName: 'GRAVITY',
    locale: 'en_IN',
    type: 'website',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': 'https://aagajfoundation.in/',
    },
    {
      '@type': 'ListItem',
      'position': 2,
      'name': 'Contact Us',
      'item': 'https://aagajfoundation.in/contact',
    },
  ],
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  )
}
