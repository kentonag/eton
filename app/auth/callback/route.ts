import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth error:', error)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      // プロフィールの作成または更新
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: data.user.email?.split('@')[0] || `user_${data.user.id.slice(0, 8)}`,
            email: data.user.email,
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    return NextResponse.redirect(
      new URL('/login?error=認証コードが提供されていません', requestUrl.origin)
    )
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=認証処理中にエラーが発生しました', requestUrl.origin)
    )
  }
}
