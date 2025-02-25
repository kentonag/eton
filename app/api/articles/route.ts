import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { title, content, excerpt } = await request.json()
    if (!title || !content) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert([
        {
          title,
          content,
          excerpt,
          user_id: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error in POST /api/articles:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
