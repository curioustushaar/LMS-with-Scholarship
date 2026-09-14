import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-6xl font-black text-[#FF2D8D]">404</h1>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-sm text-gray-600">
          The page you are looking for might have been removed or does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#FF2D8D] hover:bg-[#e02078] text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
