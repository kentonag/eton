import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { articleId, userId, amount, currency, stripeSessionId } = await req.json()

    // バリデーション
    if (!articleId || !userId || !amount || !currency || !stripeSessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // 購入レコードを作成
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert([
        {
          article_id: articleId,
          user_id: userId,
          amount,
          currency,
          stripe_session_id: stripeSessionId,
          status: 'completed'
        }
      ])
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError)
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ purchase })
  } catch (err: any) {
    console.error('Purchase API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
