import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import EditArticleForm from './EditArticleForm'
import { Database } from '@/types/schema'

interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `記事の編集: ${params.id}`,
  }
}

export default async function EditPage({ params }: Props) {
  const articleId = params.id
  if (!articleId) {
    notFound()
  }

  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('認証が必要です')
  }

  // 記事データを取得
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single()

  if (articleError || !article) {
    console.error('Article fetch error:', articleError)
    notFound()
  }

  // 編集権限チェック
  if (article.user_id !== user.id) {
    throw new Error('編集権限がありません')
  }

  // タグを取得
  const { data: articleTags, error: tagsError } = await supabase
    .from('article_tags')
    .select('tag_id')
    .eq('article_id', articleId)

  if (tagsError) {
    console.error('Tags fetch error:', tagsError)
    throw tagsError
  }

  // 記事データをクライアントコンポーネントに渡す
  return (
    <EditArticleForm
      initialArticle={{
        id: article.id,
        title: article.title,
        content: article.content,
        published: article.published,
        tags: articleTags.map(tag => tag.tag_id)
      }}
    />
  )
}
