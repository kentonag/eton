import { use } from 'react'

export default function EditArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  return children
}
