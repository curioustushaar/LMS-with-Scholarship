import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admissions | GRAVITY',
  description: 'Explore admissions, intake schedules, application guidelines, and career-focused learning opportunities through GRAVITY by AAGAJ Foundation.',
  alternates: {
    canonical: 'https://aagajfoundation.in/admissions',
  },
  openGraph: {
    title: 'Admissions | GRAVITY',
    description: 'Explore admissions and application information through GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/admissions',
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
      'name': 'Admissions',
      'item': 'https://aagajfoundation.in/admissions',
    },
  ],
}

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
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
