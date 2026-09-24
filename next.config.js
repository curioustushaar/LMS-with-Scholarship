/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'recharts', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Allow accelerometer/payment APIs needed by Razorpay checkout iframe.
            // Without this the browser fires "Permissions-Policy violation: accelerometer"
            // console warnings on every Razorpay payment session.
            // These are specifically required by Razorpay's fraud-detection & UPI flow.
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'accelerometer=(self "https://api.razorpay.com" "https://checkout.razorpay.com")',
              'payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")',
              'vibrate=()',
            ].join(', '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
