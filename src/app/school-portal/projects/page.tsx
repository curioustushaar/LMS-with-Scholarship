'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { ProjectsPageContent } from '@/app/admin/projects/page'

export default function SchoolProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2D8D] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading institutional projects...</p>
        </div>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  )
}

