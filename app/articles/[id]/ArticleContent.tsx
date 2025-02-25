'use client'

import { Database } from '@/types/schema'

type Tables = Database['public']['Tables']
type Article = Tables['articles']['Row'] & {
  profiles?: {
    id: string
    email: string
  } | null
  content: string
}

interface ArticleContentProps {
  article: Article
}

export default function ArticleContent({ article }: ArticleContentProps) {
  if (!article.content) {
    return (
      <div className="p-6 text-center text-gray-500">
        この記事にはコンテンツがありません。
      </div>
    )
  }

  return (
    <article className="p-6">
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  )
}
