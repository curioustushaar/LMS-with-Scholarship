import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Internships | GRAVITY',
  description: 'Discover internship openings, real-world industry projects, and practical learning opportunities available through GRAVITY by AAGAJ Foundation.',
  alternates: {
    canonical: 'https://aagajfoundation.in/internships',
  },
  openGraph: {
    title: 'Internships | GRAVITY',
    description: 'Discover internship and practical learning opportunities available through GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/internships',
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
      'name': 'Internships',
      'item': 'https://aagajfoundation.in/internships',
    },
  ],
}

export default function InternshipsLayout({ children }: { children: React.ReactNode }) {
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
