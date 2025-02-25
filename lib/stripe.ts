import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

interface CheckoutSessionParams {
  articleId: string
  userId: string
  amount: number
  title: string
}

export async function createCheckoutSession({
  articleId,
  userId,
  amount,
  title
}: CheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: title,
            description: '記事の購入',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}?canceled=true`,
    metadata: {
      articleId,
      userId,
    },
  })

  return session
}

export async function handleWebhookEvent(payload: string, signature: string) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { articleId, userId } = session.metadata || {}

      if (!articleId || !userId) {
        throw new Error('Missing articleId or userId in session metadata')
      }

      // Supabaseクライアントを作成
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // 購入レコードを作成
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            article_id: articleId,
            user_id: userId,
            amount: session.amount_total,
            currency: session.currency,
            stripe_session_id: session.id,
            status: 'completed'
          }
        ])

      if (purchaseError) {
        throw new Error(`Failed to create purchase record: ${purchaseError.message}`)
      }

      return { success: true }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return { success: false, message: err.message }
  }
}
