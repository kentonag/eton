export default function LoadingArticle() {
  return (
    <div className="animate-pulse">
      <div className="p-6 border-b">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>

        <div className="divide-y">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
