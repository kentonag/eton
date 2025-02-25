import { ImageResponse } from 'next/og'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'
export const alt = 'Article thumbnail'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // 記事データを取得
  const { data: article } = await supabase
    .from('articles')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single()

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1 style={{ fontSize: 48 }}>Article not found</h1>
        </div>
      ),
      {
        ...size,
      }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
        }}
      >
        {/* タイトル */}
        <h1
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: 'auto',
          }}
        >
          {article.title}
        </h1>

        {/* フッター */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* 著者情報 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {article.profiles?.avatar_url && (
              <img
                src={article.profiles.avatar_url}
                alt=""
                width={48}
                height={48}
                style={{ borderRadius: 24 }}
              />
            )}
            <span style={{ fontSize: 24, color: '#666666' }}>
              {article.profiles?.username || '名称未設定'}
            </span>
          </div>

          {/* サイトロゴ */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#1a1a1a',
            }}
          >
            Eton
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
