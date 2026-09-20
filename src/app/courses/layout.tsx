import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Courses | GRAVITY',
  description: 'Explore career-focused courses and learning programs offered through GRAVITY by AAGAJ Foundation in Full-Stack Development, Data Science, AI, Cloud Computing, and Business.',
  alternates: {
    canonical: 'https://aagajfoundation.in/courses',
  },
  openGraph: {
    title: 'Courses | GRAVITY',
    description: 'Explore career-focused courses and learning programs offered through GRAVITY by AAGAJ Foundation.',
    url: 'https://aagajfoundation.in/courses',
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
      'name': 'Courses',
      'item': 'https://aagajfoundation.in/courses',
    },
  ],
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
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
