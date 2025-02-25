'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

type CommentsProps = {
  articleId: string
}

export default function Comments({ articleId }: CommentsProps) {
  const supabase = createClientComponentClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadComments()
    checkUser()
  }, [articleId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setComments(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setError('コメントを投稿するにはログインが必要です')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            article_id: articleId,
            user_id: currentUser.id,
          },
        ])
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setComments([...comments, data])
      setNewComment('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
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

      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (loading) {
    return <div className="mt-8">コメントを読み込み中...</div>
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">コメント</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* コメント投稿フォーム */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              コメントを投稿
            </label>
            <textarea
              id="comment"
              rows={3}
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="コメントを入力してください"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-8">
          <p className="text-gray-600">
            コメントを投稿するには
            <a href="/login" className="text-blue-600 hover:underline">
              ログイン
            </a>
            してください
          </p>
        </div>
      )}

      {/* コメント一覧 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <div className="flex-shrink-0">
              {comment.profiles.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200" />
              )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{comment.profiles.username}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                {currentUser?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="mt-1 text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            まだコメントはありません
          </p>
        )}
      </div>
    </div>
  )
}
