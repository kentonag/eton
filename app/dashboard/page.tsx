import { getServerSupabaseClient } from '@/utils/supabase-server'
import DashboardClient from './DashboardClient'

export default async function Dashboard() {
  const supabase = await getServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return (
      <div className="p-6">
        <p className="text-red-500">ログインが必要です</p>
      </div>
    )
  }

  // 記事データを取得
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      *,
      comments:comments(count),
      likes:likes(count)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">エラーが発生しました: {error.message}</p>
      </div>
    )
  }

  // コメント数といいね数を加工
  const articlesWithCounts = articles.map(article => ({
    ...article,
    _count: {
      comments: article.comments[0]?.count ?? 0,
      likes: article.likes[0]?.count ?? 0
    }
  }))

  return <DashboardClient initialArticles={articlesWithCounts} userId={session.user.id} />
}
