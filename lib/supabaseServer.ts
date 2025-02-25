import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/schema'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// サーバーコンポーネント用のヘルパー関数
export async function fetchServerData<T>(
  fetcher: (supabase: ReturnType<typeof createServerSupabaseClient>) => Promise<T>
): Promise<T> {
  const supabase = await createServerSupabaseClient()
  return fetcher(supabase)
}
