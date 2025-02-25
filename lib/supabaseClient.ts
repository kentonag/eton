import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/schema'

// シングルトンインスタンスを作成
export const supabase = createClientComponentClient<Database>()

// サインアウト処理をラップ
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

// クライアントコンポーネント用のヘルパー関数
export async function fetchData<T>(
  fetcher: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fetcher()
  } catch (error) {
    if (errorHandler && error instanceof Error) {
      errorHandler(error)
    } else {
      console.error('Error fetching data:', error)
    }
    return null
  }
}
