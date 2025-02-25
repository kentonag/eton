'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase'

type Tag = {
  id: string
  name: string
}

type TagSelectorProps = {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export default function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      console.error('Error loading tags:', err)
      setError('タグの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name: newTag.trim() }])
        .select()
        .single()

      if (error) throw error

      setTags([...tags, data])
      setNewTag('')
      onTagsChange([...selectedTags, data.id])
    } catch (err) {
      console.error('Error adding tag:', err)
      setError('タグの追加に失敗しました')
    }
  }

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  if (loading) {
    return <div className="text-gray-500">タグを読み込み中...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagSelect(tag.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTags.includes(tag.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="新しいタグを追加"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          追加
        </button>
      </div>
    </div>
  )
}
