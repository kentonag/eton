import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TagList from '@/components/TagList'

export default async function TagPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // タグ情報を取得
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!tag) {
    notFound()
  }

  // タグに関連する記事を取得
  const { data: articles } = await supabase
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
    .eq('article_tags.tag_id', params.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          タグ: {tag.name}
        </h1>
        <p className="text-gray-600 mb-6">
          {articles?.length || 0} 件の記事
        </p>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            その他のタグ
          </h2>
          <TagList />
        </div>
      </div>

      {articles && articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            このタグの記事はまだありません
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
                        className={`
                          inline-flex items-center px-3 py-1 rounded-full text-sm
                          ${
                            tags.id === params.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        `}
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
