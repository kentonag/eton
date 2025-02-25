'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Article = {
  id: string
  title: string
  published: boolean
  created_at: string
  updated_at: string
  _count?: {
    comments: number
    likes: number
  }
}

type DashboardClientProps = {
  initialArticles: Article[]
  userId: string
}

export default function DashboardClient({ initialArticles, userId }: DashboardClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('この記事を削除してもよろしいですか？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
        .eq('user_id', userId) // 追加のセキュリティチェック

      if (error) throw error

      // 記事リストを更新
      setArticles(articles.filter(article => article.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">記事一覧</h1>
        <Link
          href="/articles/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                統計
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {article.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {article.published ? '公開中' : '下書き'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>👍 {article._count?.likes ?? 0}</span>
                    <span>💭 {article._count?.comments ?? 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link
                    href={`/articles/${article.id}/edit`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            記事がありません
          </div>
        )}
      </div>
    </div>
  )
}
