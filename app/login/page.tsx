'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import toast from 'react-hot-toast'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const error = searchParams.get('error')
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          router.replace(redirectTo)
        }
      } catch (err) {
        console.error('Error checking auth:', err)
      }
    }

    checkAuth()

    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [router, redirectTo, error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Etonへようこそ
            </h2>
            <p className="text-gray-600 mb-8">
              技術記事共有プラットフォーム
            </p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 text-sm font-medium rounded-md',
                input: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
              },
            }}
            providers={['github']}
            redirectTo={`${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: 'ログイン',
                  loading_button_label: 'ログイン中...',
                  social_provider_text: '{{provider}}でログイン',
                  link_text: 'すでにアカウントをお持ちの方',
                },
                sign_up: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: 'アカウント作成',
                  loading_button_label: '作成中...',
                  social_provider_text: '{{provider}}で登録',
                  link_text: '新規登録はこちら',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
