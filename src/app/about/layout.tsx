import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | GRAVITY',
  description: 'Learn about GRAVITY by AAGAJ Foundation, India\'s leading technology and professional education ecosystem connecting students with mentors, projects, and careers.',
  alternates: {
    canonical: 'https://aagajfoundation.in/about',
  },
  openGraph: {
    title: 'About Us | GRAVITY',
    description: 'Empowering Minds. Shaping Futures. Learn about GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/about',
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
      'name': 'About Us',
      'item': 'https://aagajfoundation.in/about',
    },
  ],
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
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
