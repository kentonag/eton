'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/schema'

type Profile = {
  username: string
  display_name: string | null
  website: string | null
  bio: string | null
  avatar_url: string | null
}

export default function Profile() {
  const supabase = createClientComponentClient<Database>()
  const [profile, setProfile] = useState<Profile>({
    username: '',
    display_name: null,
    website: null,
    bio: null,
    avatar_url: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name,
          website: data.website,
          bio: data.bio,
          avatar_url: data.avatar_url,
        })
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccessMessage('プロフィールを更新しました')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value || null }))
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
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名*
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            value={profile.username}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            公開プロフィールで使用される一意の識別子です
          </p>
        </div>

        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
            表示名
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={profile.display_name || ''}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Webサイト
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={profile.website || ''}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            自己紹介
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={profile.bio || ''}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  )
}
