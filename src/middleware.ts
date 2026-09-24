import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected portal route patterns
  const isSuperadminRoute = pathname.startsWith('/superadmin') && pathname !== '/superadmin/login'
  const isSchoolRoute = pathname.startsWith('/school-portal') && pathname !== '/school-portal/login'
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/login'
  const isStudentRoute = pathname.startsWith('/student') && pathname !== '/login'
  const isApiRoute = pathname.startsWith('/api/')

  const response = NextResponse.next()

  // Apply Strict Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CORS restriction for API routes
  if (isApiRoute) {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://www.aagajfoundation.in',
      'https://aagajfoundation.in',
    ]
    if (origin && (allowedOrigins.includes(origin) || origin.includes('aagajfoundation.in') || origin.includes('localhost'))) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
  }

  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers })
  }

  // Apply Strict No-Cache Headers to Protected Routes to prevent browser BFCache restoration after logout
  if (isSuperadminRoute || isSchoolRoute || isAdminRoute || isStudentRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
  }

  return response
}

export const config = {
  matcher: [
    '/superadmin/:path*',
    '/school-portal/:path*',
    '/admin/:path*',
    '/student/:path*',
    '/api/:path*',
  ],
}
