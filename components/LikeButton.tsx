'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type LikeButtonProps = {
  articleId: string
  initialLikeCount: number
  initialIsLiked: boolean
}

export default function LikeButton({
  articleId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // リアルタイム更新のサブスクリプション
  useEffect(() => {
    const channel = supabase
      .channel('likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `article_id=eq.${articleId}`,
        },
        async () => {
          // いいね数を再取得
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact' })
            .eq('article_id', articleId)

          setLikeCount(count || 0)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [articleId])

  const handleLike = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('いいねするにはログインが必要です')
        return
      }

      if (isLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id)

        if (error) throw error

        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              article_id: articleId,
              user_id: user.id,
            },
          ])

        if (error) throw error

        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleLike}
        disabled={loading}
        className={`
          inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium
          transition-colors duration-200
          ${
            isLiked
              ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          disabled:opacity-50
        `}
        title={error || undefined}
      >
        <span className="text-lg">
          {isLiked ? '❤️' : '🤍'}
        </span>
        <span>{likeCount}</span>
      </button>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
