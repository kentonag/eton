import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function middleware(req: NextRequest) {
  try {
    // ルートパスへのアクセスを/articlesにリダイレクト
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/articles', req.url))
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // セッションの更新
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      logger.error('Error in auth middleware', error)
      throw error
    }

    // 未認証ユーザーのアクセス制限
    if (!session && req.nextUrl.pathname.startsWith('/articles/new')) {
      logger.info('Unauthorized access attempt to protected route', {
        path: req.nextUrl.pathname,
      })
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (!session && req.nextUrl.pathname === '/dashboard') {
      logger.info('Unauthorized access attempt to protected route', {
        path: req.nextUrl.pathname,
      })
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // ログイン済みユーザーのリダイレクト
    if (session && req.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/articles', req.url))
    }

    return res
  } catch (error) {
    logger.error(
      'Middleware error',
      error instanceof Error ? error : new Error(String(error))
    )
    // エラー時は通常のレスポンスを返す（エラーページにリダイレクトすることも可能）
    return NextResponse.next()
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/', '/articles/new', '/dashboard', '/login']
}
