import TagList from '@/components/TagList'

export default function TagsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">タグ一覧</h1>
        <p className="text-gray-600">
          記事に付けられているタグの一覧です。タグをクリックすると、そのタグが付けられた記事を見ることができます。
        </p>
      </div>

      <TagList />
    </div>
  )
}
