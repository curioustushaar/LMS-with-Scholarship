import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Programs | GRAVITY',
  description: 'Explore industry-driven skill training programs and professional certifications offered through GRAVITY by AAGAJ Foundation.',
  alternates: {
    canonical: 'https://aagajfoundation.in/training',
  },
  openGraph: {
    title: 'Training Programs | GRAVITY',
    description: 'Explore professional skill training programs offered through GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/training',
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
      'name': 'Training Programs',
      'item': 'https://aagajfoundation.in/training',
    },
  ],
}

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
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
