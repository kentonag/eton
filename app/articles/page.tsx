import { Suspense } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import ArticleList from '@/components/ArticleList'
import LoadingArticles from '@/components/LoadingArticles'
import { Database } from '@/types/schema'
import { SupabaseClient } from '@supabase/supabase-js'

type Article = Database['public']['Tables']['articles']['Row'] & {
  profiles?: {
    email: string
  } | null
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ArticlesPage() {
  let supabase: SupabaseClient<Database>

  try {
    supabase = await createServerSupabaseClient()
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h2 className="text-red-800 text-lg font-semibold mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-600">
            データベースへの接続に失敗しました。しばらく経ってから再度お試しください。
          </p>
        </div>
      </div>
    )
  }

  try {
    // ユーザー情報を取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error fetching user:', userError)
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h2 className="text-red-800 text-lg font-semibold mb-2">
              認証エラー
            </h2>
            <p className="text-red-600">
              ユーザー情報の取得に失敗しました。再度ログインしてください。
            </p>
          </div>
        </div>
      )
    }

    // 記事一覧を取得
    console.debug('Fetching articles')
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        created_at,
        user_id,
        profiles:user_id (
          email
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching articles:', error)
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h2 className="text-red-800 text-lg font-semibold mb-2">
              データ取得エラー
            </h2>
            <p className="text-red-600">
              記事の読み込み中にエラーが発生しました。しばらく経ってから再度お試しください。
            </p>
          </div>
        </div>
      )
    }

    if (!data) {
      console.error('No data returned from articles query')
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h2 className="text-yellow-800 text-lg font-semibold mb-2">
              記事が見つかりません
            </h2>
            <p className="text-yellow-600">
              現在、公開されている記事はありません。
            </p>
          </div>
        </div>
      )
    }

    const articles = data as Article[]

    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">記事一覧</h1>
          {user && (
            <Link
              href="/articles/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              新規作成
            </Link>
          )}
        </div>

        <Suspense fallback={<LoadingArticles />}>
          <ArticleList articles={articles} />
        </Suspense>
      </main>
    )
  } catch (error) {
    console.error('Error in ArticlesPage:', error)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h2 className="text-red-800 text-lg font-semibold mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-600">
            予期せぬエラーが発生しました。しばらく経ってから再度お試しください。
            {error instanceof Error ? `: ${error.message}` : ''}
          </p>
        </div>
      </div>
    )
  }
}
