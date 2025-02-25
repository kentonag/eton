import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/schema'

export async function getServerSession() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      logger.error('Error getting user', error)
      throw error
    }

    return user
  } catch (error) {
    logger.error(
      'Error in getServerSession',
      error instanceof Error ? error : new Error(String(error))
    )
    return null
  }
}

export async function requireAuth() {
  const user = await getServerSession()

  if (!user) {
    logger.info('User not authenticated, redirecting to login')
    redirect('/auth/login')
  }

  return user
}

export async function getUser() {
  return getServerSession()
}
