// Copy this template to update remaining pages quickly

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function YourPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // REPLACE WITH YOUR API CALL:
      // For Tasks: const result = await api.tasks.getAll()
      // For Projects: const result = await api.projects.getAll()
      // For Badges: const result = await api.badges.getAll()
      // For Certificates: const result = await api.certificates.getPending()
      // For Tickets: const result = await api.tickets.getAll()
      // For Reports: const result = await api.reports.getOverview()
      
      // const result = await api.YOUR_MODULE.YOUR_METHOD()
      // setData(result || [])
      setData([])
    } catch (err: any) {
      console.error('Failed to load data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg">No data found</p>
      </div>
    )
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Your existing UI here - just replace dummy data with 'data' variable */}
      {data.map((item) => (
        <div key={item.id}>
          {/* Your component */}
        </div>
      ))}
    </div>
  )
}
