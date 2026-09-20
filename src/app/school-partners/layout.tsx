import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'School Partners | GRAVITY',
  description: 'School and institutional partnership programs powered by GRAVITY by AAGAJ Foundation to elevate academic curriculum and digital learning infrastructure.',
  alternates: {
    canonical: 'https://aagajfoundation.in/school-partners',
  },
  openGraph: {
    title: 'School Partners | GRAVITY',
    description: 'School and institutional partnership programs powered by GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/school-partners',
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
      'name': 'School Partners',
      'item': 'https://aagajfoundation.in/school-partners',
    },
  ],
}

export default function SchoolPartnersLayout({ children }: { children: React.ReactNode }) {
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
