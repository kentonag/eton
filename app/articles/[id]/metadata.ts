import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })

  // 記事データを取得
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      profiles:user_id (
        username
      )
    `)
    .eq('id', params.id)
    .single()

  if (!article) {
    return {
      title: 'Article not found',
    }
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.id}`

  return {
    title: article.title,
    description: article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      url,
      siteName: 'Eton',
      locale: 'ja_JP',
      type: 'article',
      authors: [article.profiles?.username || '名称未設定'],
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
    },
  }
}
