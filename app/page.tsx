import { Suspense } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import ArticleList from '@/components/ArticleList'
import LoadingArticles from '@/components/LoadingArticles'
import { Database } from '@/types/schema'
import { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

type Article = Database['public']['Tables']['articles']['Row'] & {
  profiles?: {
    email: string
  } | null
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    redirect('/articles')
  } catch (error) {
    console.error('Error redirecting to articles:', error)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h2 className="text-red-800 text-lg font-semibold mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-600">
            ページの読み込みに失敗しました。
            <a href="/articles" className="underline hover:text-red-800">
              記事一覧ページ
            </a>
            に直接アクセスしてください。
          </p>
        </div>
      </div>
    )
  }
}
