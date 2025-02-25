import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import ArticleContent from './ArticleContent'
import ArticleHeader from './ArticleHeader'
import ArticleComments from './ArticleComments'
import PurchaseButton from './PurchaseButton'
import { Database } from '@/types/schema'
import { SupabaseClient } from '@supabase/supabase-js'
import { Metadata } from 'next'

type Tables = Database['public']['Tables']
type Article = Tables['articles']['Row'] & {
  profiles?: {
    id: string
    email: string
  } | null
  is_purchased?: boolean
  price?: number
}

type Comment = Tables['comments']['Row'] & {
  profiles?: {
    id: string
    email: string
  } | null
}

interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Article: ${params.id}`,
  }
}

export default async function ArticlePage({ params }: Props) {
  const articleId = params.id
  if (!articleId) {
    notFound()
  }

  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // 記事データを取得
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*, profiles(id, email)')
      .eq('id', articleId)
      .single()

    if (articleError || !article) {
      notFound()
    }

    // ユーザーが記事を購入済みかチェック
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .single()
      
      article.is_purchased = !!purchase
    }

    // 記事が非公開の場合、現在のユーザーが作者かどうかを確認
    if (!article.published) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error fetching user:', userError)
        throw userError
      }

      if (!user || user.id !== article.user_id) {
        console.error('Unauthorized access to unpublished article:', articleId)
        notFound()
      }
    }

    // コメントを取得
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*, profiles(id, email)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Comments fetch error:', commentsError)
      throw commentsError
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <ArticleHeader article={article} />
        {article.price === 0 ? (
          <ArticleContent article={article} />
        ) : article.is_purchased ? (
          <ArticleContent article={article} />
        ) : (
          <div className="my-8 p-8 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">この記事は有料コンテンツです</h2>
            <p className="mb-4">記事の続きを読むには購入が必要です。</p>
            <PurchaseButton articleId={article.id} price={article.price} />
          </div>
        )}
        <div className="mt-12">
          <Suspense fallback={<div>Loading comments...</div>}>
            <ArticleComments articleId={articleId} initialComments={comments} />
          </Suspense>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('Error:', error)
    throw error
  }
}
