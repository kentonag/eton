'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Stats = {
  totalArticles: number
  publishedArticles: number
  totalViews: number
  totalLikes: number
  totalComments: number
  recentArticles: {
    id: string
    title: string
    views: number
    likes: number
    comments: number
    created_at: string
  }[]
}

export default function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentArticles: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      // 記事の統計情報を取得
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          published,
          created_at,
          comments:comments(count),
          likes:likes(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (articlesError) throw articlesError

      // 統計情報を計算
      const totalArticles = articles.length
      const publishedArticles = articles.filter(a => a.published).length
      const totalLikes = articles.reduce((sum, article) => sum + (article.likes[0]?.count ?? 0), 0)
      const totalComments = articles.reduce((sum, article) => sum + (article.comments[0]?.count ?? 0), 0)

      // 最近の記事（最新5件）の詳細情報
      const recentArticles = articles.slice(0, 5).map(article => ({
        id: article.id,
        title: article.title,
        views: 0, // ビュー数は現在未実装
        likes: article.likes[0]?.count ?? 0,
        comments: article.comments[0]?.count ?? 0,
        created_at: article.created_at,
      }))

      setStats({
        totalArticles,
        publishedArticles,
        totalViews: 0, // ビュー数は現在未実装
        totalLikes,
        totalComments,
        recentArticles,
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">統計情報</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 概要統計 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    総記事数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalArticles}
                    </div>
                    <div className="ml-2">
                      <span className="text-sm text-gray-500">
                        公開: {stats.publishedArticles}
                      </span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    総いいね数
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalLikes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    総コメント数
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalComments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近の記事 */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">最近の記事</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {stats.recentArticles.map((article) => (
            <li key={article.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <a
                    href={`/articles/${article.id}`}
                    className="text-sm font-medium text-blue-600 truncate hover:underline"
                  >
                    {article.title}
                  </a>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className="inline-flex items-center text-sm text-gray-500">
                      👍 {article.likes}
                    </span>
                    <span className="ml-4 inline-flex items-center text-sm text-gray-500">
                      💭 {article.comments}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {new Date(article.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
