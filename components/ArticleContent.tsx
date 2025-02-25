export default function ArticleContent({ content }: { content: string }) {
  return (
    <div 
      className="prose max-w-none mb-8"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
