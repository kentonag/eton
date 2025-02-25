'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'
import { Database } from '@/types/schema'

type Tables = Database['public']['Tables']
type Article = Tables['articles']['Row'] & {
  profiles?: {
    id: string
    email: string
  } | null
}

interface ArticleHeaderProps {
  article: Article
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const [likesCount, setLikesCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ユーザー情報を取得
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setCurrentUser(user)

        // いいね数を取得
        const { count, error: countError } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', article.id)

        if (countError) throw countError
        setLikesCount(count || 0)

        // ユーザーがいいねしているかチェック
        if (user) {
          const { data: likeData, error: likeError } = await supabase
            .from('likes')
            .select('article_id')
            .eq('article_id', article.id)
            .eq('user_id', user.id)
            .maybeSingle()

          if (likeError && likeError.code !== 'PGRST116') throw likeError
          setHasLiked(!!likeData)
        }
      } catch (error) {
        logger.error('Error in ArticleHeader:', error)
      }
    }

    fetchData()
  }, [article.id])

  const handleLike = async () => {
    if (!currentUser) return
    setIsLoading(true)

    try {
      if (hasLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', currentUser.id)

        if (error) throw error

        setLikesCount((prev) => prev - 1)
        setHasLiked(false)
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('likes')
          .insert({
            article_id: article.id,
            user_id: currentUser.id
          })

        if (error) throw error

        setLikesCount((prev) => prev + 1)
        setHasLiked(true)
      }
    } catch (error) {
      logger.error('Error handling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-b pb-4 mb-4">
      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
      <div className="flex items-center justify-between text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            投稿者: {article.profiles?.email || '不明'}
          </span>
          <span>
            {new Date(article.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            disabled={!currentUser || isLoading}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              hasLiked
                ? 'bg-pink-100 text-pink-600'
                : 'bg-gray-100 text-gray-600'
            } ${!currentUser && 'opacity-50 cursor-not-allowed'}`}
          >
            <span>♥</span>
            <span>{likesCount}</span>
          </button>
          {article.user_id === currentUser?.id && (
            <Link
              href={`/articles/${article.id}/edit`}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              編集
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
