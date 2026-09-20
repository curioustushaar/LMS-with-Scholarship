import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employers | GRAVITY',
  description: 'Partner with GRAVITY by AAGAJ Foundation to recruit job-ready candidates, host recruitment drives, and post internship opportunities.',
  alternates: {
    canonical: 'https://aagajfoundation.in/employers',
  },
  openGraph: {
    title: 'Employers | GRAVITY',
    description: 'Partner with GRAVITY by AAGAJ Foundation to recruit top talent and job-ready graduates.',
    url: 'https://aagajfoundation.in/employers',
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
      'name': 'Employers',
      'item': 'https://aagajfoundation.in/employers',
    },
  ],
}

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
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
