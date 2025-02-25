'use client'

import Link from 'next/link'

interface Article {
  id: string
  title: string
  excerpt: string
  created_at: string
  user_id: string
  profiles: {
    email: string
  } | null
}

interface ArticleListProps {
  articles: Article[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <article
          key={article.id}
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <Link href={`/articles/${article.id}`}>
            <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">
              {article.title}
            </h2>
          </Link>

          <div className="flex items-center text-gray-600 text-sm mb-4">
            <img
              src="/default-avatar.png"
              alt={article.profiles?.email || '匿名'}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{article.profiles?.email || '匿名'}</span>
            <span className="mx-2">•</span>
            <time dateTime={article.created_at}>
              {new Date(article.created_at).toLocaleDateString('ja-JP')}
            </time>
          </div>

          {article.excerpt && (
            <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
          )}
        </article>
      ))}
    </div>
  )
}
