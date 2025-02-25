import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    console.log('Received webhook request')

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400, headers: corsHeaders }
      )
    }

    let event: Stripe.Event
    try {
      console.log('Verifying Stripe signature')
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Error verifying webhook signature:', err.message)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('Webhook event type:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Processing completed checkout session:', session.id)

      const { metadata } = session
      console.log('Session metadata:', metadata)

      const articleId = metadata?.articleId
      const userId = metadata?.userId

      if (!articleId || !userId) {
        console.error('Missing required metadata:', { articleId, userId })
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400, headers: corsHeaders }
        )
      }

      // 既存の購入レコードをチェック
      console.log('Checking for existing purchase')
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single()

      if (existingPurchase) {
        console.log('Purchase already exists:', existingPurchase)
        return NextResponse.json(
          { message: 'Purchase already processed' },
          { headers: corsHeaders }
        )
      }

      console.log('Creating purchase record')
      const { data: purchase, error: purchaseError } = await supabase
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
        .select()
        .single()

      if (purchaseError) {
        console.error('Purchase creation error:', purchaseError)
        return NextResponse.json(
          { error: `Failed to create purchase: ${purchaseError.message}` },
          { status: 500, headers: corsHeaders }
        )
      }

      console.log('Purchase record created successfully:', purchase)
      return NextResponse.json(
        { success: true, purchase },
        { headers: corsHeaders }
      )
    }

    // その他のイベントタイプは正常に処理
    return NextResponse.json(
      { received: true, type: event.type },
      { headers: corsHeaders }
    )
  } catch (err: any) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: err.message,
        code: err.code
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
