export default function LoadingArticles() {
  return (
    <div className="animate-pulse space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="mx-2 h-4 bg-gray-200 rounded w-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
