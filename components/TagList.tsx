'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Tag = {
  id: string
  name: string
  article_count: number
}

export default function TagList() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        // タグと、そのタグが付けられた公開済み記事数を取得
        const { data, error } = await supabase
          .from('tags')
          .select(`
            *,
            article_tags!inner (
              articles!inner (
                id,
                published
              )
            )
          `)
          .eq('article_tags.articles.published', true)
          .order('name')

        if (error) throw error

        // 記事数を含むタグデータを整形
        const tagsWithCount = data.map(tag => ({
          id: tag.id,
          name: tag.name,
          article_count: tag.article_tags.length
        }))

        setTags(tagsWithCount)
      } catch (error: any) {
        console.error('Error loading tags:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  if (loading) {
    return <div>タグを読み込み中...</div>
  }

  if (error) {
    return (
      <div className="text-red-600">
        タグの読み込み中にエラーが発生しました: {error}
      </div>
    )
  }

  if (tags.length === 0) {
    return <div>タグがありません</div>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.id}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <span>{tag.name}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs">
            {tag.article_count}
          </span>
        </Link>
      ))}
    </div>
  )
}
