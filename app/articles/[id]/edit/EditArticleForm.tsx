'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Editor from '@/components/Editor'

interface EditArticleFormProps {
  initialArticle: {
    id: string
    title: string
    content: string | null
    published: boolean
    tags?: string[]
  }
}

export default function EditArticleForm({ initialArticle }: EditArticleFormProps) {
  const router = useRouter()

  // サーバーコンポーネントから受け取った初期値を useState にセット
  const [title, setTitle] = useState(initialArticle.title)
  const [content, setContent] = useState(initialArticle.content || '')
  const [isPublic, setIsPublic] = useState(initialArticle.published)
  const [tags, setTags] = useState<string[]>(initialArticle.tags || [])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      // 記事を更新
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title,
          content,
          published: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialArticle.id)

      if (updateError) throw updateError

      // タグを更新
      // 一旦全て削除して新しいタグを追加
      const { error: deleteTagsError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', initialArticle.id)

      if (deleteTagsError) throw deleteTagsError

      if (tags.length > 0) {
        const { error: insertTagsError } = await supabase
          .from('article_tags')
          .insert(
            tags.map(tagId => ({
              article_id: initialArticle.id,
              tag_id: tagId
            }))
          )

        if (insertTagsError) throw insertTagsError
      }

      // 更新後、記事詳細ページへ遷移
      router.push(`/articles/${initialArticle.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">記事編集</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-4 mb-6 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block font-medium mb-2">タイトル</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">本文</label>
        <Editor
          initialContent={content}
          onChange={setContent}
        />
      </div>

      <div className="mb-6 flex items-center">
        <input
          id="published"
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <label htmlFor="published" className="ml-2 text-gray-700">
          公開する
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
