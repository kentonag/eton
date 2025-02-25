import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 記事の存在確認と価格チェック
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single()

    if (articleError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // 無料記事の場合はエラー
    if (article.price === 0) {
      return NextResponse.json(
        { error: 'This article is free' },
        { status: 400 }
      )
    }

    // 既に購入済みかチェック
    const { data: existingPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .single()

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Article already purchased' },
        { status: 400 }
      )
    }

    // Stripeセッションの作成
    const session = await createCheckoutSession({
      articleId: article.id,
      userId: user.id,
      amount: article.price,
      title: article.title || '記事の購入'
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Purchase error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
