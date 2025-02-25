import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { logger } from '@/lib/logger'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  try {
    // すでにログインしている場合はホームページにリダイレクト
    const user = await getUser()
    if (user) {
      logger.info('User already logged in, redirecting to home')
      redirect('/')
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in LoginPage',
      error instanceof Error ? error : new Error(String(error))
    )
    throw error
  }
}
