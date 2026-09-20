export default function SuperadminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#C81E4E]/20 border-t-[#C81E4E] rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading Superadmin Dashboard...</p>
      </div>
    </div>
  )
}
