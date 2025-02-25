'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Article page error:', error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          記事の読み込みに失敗しました
        </h2>
        <p className="text-gray-600 mb-4">
          申し訳ありません。記事の読み込み中にエラーが発生しました。
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            もう一度読み込む
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
