import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aagajfoundation.in'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/courses',
          '/courses/*',
          '/scholarships',
          '/admissions',
          '/internships',
          '/employers',
          '/school-partners',
          '/training',
          '/contact',
        ],
        disallow: [
          '/login',
          '/student',
          '/student/*',
          '/admin',
          '/admin/*',
          '/superadmin',
          '/superadmin/*',
          '/school-portal',
          '/school-portal/*',
          '/api',
          '/api/*',
          '/certificate',
          '/certificate/*',
          '/task',
          '/task/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
