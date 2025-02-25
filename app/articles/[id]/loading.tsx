export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  )
}
