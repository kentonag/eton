import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// サーバーサイドでのみ使用するため、ブラウザ環境では無視される
const isBrowser = typeof window !== 'undefined'
const supabaseClient = isBrowser ? createClientComponentClient<Database>() : null

export function getSupabaseClient() {
  if (!isBrowser) {
    throw new Error('getSupabaseClient should only be called in browser environment')
  }
  return supabaseClient!
}
