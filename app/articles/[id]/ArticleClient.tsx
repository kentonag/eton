'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Comments from '@/components/Comments'
import LikeButton from '@/components/LikeButton'
import ShareButtons from '@/components/ShareButtons'

interface Profile {
  email: string
}

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  created_at: string
  user_id: string
  profiles: Profile | null
}

interface ArticleClientProps {
  article: Article
}

export default function ArticleClient({ article }: ArticleClientProps) {
  const supabase = createClientComponentClient()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [hasLiked, setHasLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    const fetchUserAndLikes = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Get like count
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact' })
          .eq('article_id', article.id)

        setLikeCount(count || 0)

        // Check if current user has liked
        if (user) {
          const { data: like } = await supabase
            .from('likes')
            .select('id')
            .eq('article_id', article.id)
            .eq('user_id', user.id)
            .single()

          setHasLiked(!!like)
        }
      } catch (error) {
        console.error('Error fetching user and likes:', error)
      }
    }

    fetchUserAndLikes()
  }, [article.id])

  const handleLike = async () => {
    if (!currentUser) return

    try {
      if (hasLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', currentUser.id)
        setLikeCount(prev => prev - 1)
      } else {
        await supabase
          .from('likes')
          .insert({
            article_id: article.id,
            user_id: currentUser.id
          })
        setLikeCount(prev => prev + 1)
      }
      setHasLiked(!hasLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const isAuthor = currentUser?.id === article.user_id

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article className="prose lg:prose-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-gray-600">
            <img
              src="/default-avatar.png"
              alt={article.profiles?.email || '匿名'}
              className="w-8 h-8 rounded-full mr-3"
            />
            <span>{article.profiles?.email || '匿名'}</span>
            <span className="mx-2">•</span>
            <time dateTime={article.created_at}>
              {new Date(article.created_at).toLocaleDateString('ja-JP')}
            </time>
          </div>
        </div>

        {article.excerpt && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-gray-600">{article.excerpt}</p>
          </div>
        )}

        <div className="mt-8 whitespace-pre-wrap">{article.content}</div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
              hasLiked
                ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg
              className={`w-5 h-5 ${hasLiked ? 'text-pink-700' : 'text-gray-500'}`}
              fill={hasLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>

          <ShareButtons
            url={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.id}`}
            title={article.title}
            description={article.excerpt || ''}
            articleId={article.id}
          />
        </div>

        {isAuthor && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => {/* 編集機能を実装予定 */}}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              編集する
            </button>
            <button
              onClick={() => {/* 削除機能を実装予定 */}}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              削除する
            </button>
          </div>
        )}

        <Comments articleId={article.id} />
      </article>
    </div>
  )
}
