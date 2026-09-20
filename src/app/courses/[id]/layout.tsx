import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const courseId = params?.id || '1'
  const canonicalUrl = `https://aagajfoundation.in/courses/${courseId}`

  return {
    title: 'Course Details | GRAVITY',
    description: 'Explore course curriculum, schedule, instructor details, and enrollment options through GRAVITY by AAGAJ Foundation.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Course Details | GRAVITY',
      description: 'Explore course curriculum and enrollment options through GRAVITY by AAGAJ Foundation.',
      url: canonicalUrl,
      siteName: 'GRAVITY',
      locale: 'en_IN',
      type: 'website',
    },
  }
}

export default function CourseDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
