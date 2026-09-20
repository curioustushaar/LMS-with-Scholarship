import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scholarships | GRAVITY',
  description: 'Explore scholarship opportunities, eligibility information, fee waiver schemes, and application details through GRAVITY by AAGAJ Foundation.',
  alternates: {
    canonical: 'https://aagajfoundation.in/scholarships',
  },
  openGraph: {
    title: 'Scholarships | GRAVITY',
    description: 'Explore scholarship opportunities and application details through GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/scholarships',
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
      'name': 'Scholarships',
      'item': 'https://aagajfoundation.in/scholarships',
    },
  ],
}

export default function ScholarshipsLayout({ children }: { children: React.ReactNode }) {
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
