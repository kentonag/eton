'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: {
    id: string
    email: string
  } | null
}

interface ArticleCommentsProps {
  initialComments: Comment[]
  articleId: string
}

export default function ArticleComments({
  initialComments = [],
  articleId,
}: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          article_id: articleId,
          user_id: currentUser.id,
        })
        .select(
          `
          *,
          profiles:user_id (
            id,
            email
          )
        `
        )
        .single()

      if (error) throw error

      setComments((prev) => [...prev, comment])
      setNewComment('')
    } catch (error) {
      logger.error(
        'Error posting comment',
        error instanceof Error ? error : new Error(String(error))
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!currentUser) return
    if (!window.confirm('このコメントを削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.id)

      if (error) throw error

      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
    } catch (error) {
      logger.error(
        'Error deleting comment',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">コメント</h2>
      </div>

      <div className="divide-y">
        {comments.map((comment) => (
          <div key={comment.id} className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {comment.profiles?.email || '不明なユーザー'}
                </span>
                <time className="text-sm text-gray-500" dateTime={comment.created_at}>
                  {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                </time>
              </div>
              {currentUser?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  削除
                </button>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="p-6 border-t">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className={`
                px-4 py-2 bg-blue-600 text-white rounded-lg
                ${
                  isSubmitting || !newComment.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }
              `}
            >
              {isSubmitting ? '送信中...' : 'コメントする'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 border-t text-center text-gray-500">
          コメントするにはログインが必要です
        </div>
      )}
    </div>
  )
}
