'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-xl p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-4">
          申し訳ありません。予期せぬエラーが発生しました。
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            もう一度試す
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors inline-block"
          >
            トップページに戻る
          </a>
        </div>
      </div>
    </div>
  )
}
