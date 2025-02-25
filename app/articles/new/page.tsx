'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/schema'

export default function NewArticle() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [price, setPrice] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      setError('すべての項目を入力してください')
      setIsSubmitting(false)
      return
    }

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw new Error('認証エラーが発生しました')
      }
      if (!user) {
        throw new Error('ログインが必要です')
      }

      // Insert article
      const { data: article, error: insertError } = await supabase
        .from('articles')
        .insert({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim(),
          price: price,
          user_id: user.id,
          published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('記事の作成に失敗しました')
      }
      if (!article) {
        throw new Error('記事の作成に失敗しました')
      }

      // Redirect to the new article
      router.push(`/articles/${article.id}`)
      router.refresh()
    } catch (err) {
      console.error('Error creating article:', err)
      setError(err instanceof Error ? err.message : '記事の作成中にエラーが発生しました')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">新規記事の投稿</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
            概要
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            価格 (円)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="price"
              min="0"
              step="100"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">円</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            0円の場合は無料記事として公開されます
          </p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            本文
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  )
}
