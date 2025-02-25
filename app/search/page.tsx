import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

type SearchParams = {
  q?: string
  tag?: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createServerComponentClient({ cookies })
  const query = searchParams.q || ''
  const tagId = searchParams.tag

  // 検索クエリを構築
  let articlesQuery = supabase
    .from('articles')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      ),
      article_tags!inner (
        tags (
          id,
          name
        )
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  // タグによるフィルタリング
  if (tagId) {
    articlesQuery = articlesQuery
      .eq('article_tags.tags.id', tagId)
  }

  // キーワードによる検索
  if (query) {
    articlesQuery = articlesQuery
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  }

  // 検索を実行
  const { data: articles, error } = await articlesQuery

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">記事を探す</h1>
        <SearchBar />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          検索中にエラーが発生しました
        </div>
      )}

      {articles && articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {query
              ? `"${query}" に一致する記事が見つかりませんでした`
              : 'まだ記事がありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {articles?.map((article) => (
            <article key={article.id} className="border-b pb-8">
              <Link href={`/articles/${article.id}`} className="block group">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                  {article.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <div className="flex items-center">
                    {article.profiles?.avatar_url && (
                      <img
                        src={article.profiles.avatar_url}
                        alt=""
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span>{article.profiles?.username || '名称未設定'}</span>
                  </div>
                  <time dateTime={article.created_at}>
                    {new Date(article.created_at).toLocaleDateString('ja-JP')}
                  </time>
                </div>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                {article.article_tags && article.article_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.article_tags.map(({ tags }) => (
                      <span
                        key={tags.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        {tags.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
