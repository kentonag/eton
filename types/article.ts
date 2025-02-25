export interface Tag {
  id: string
  name: string
}

export interface ArticleTag {
  tags: Tag
}

export interface Profile {
  username: string
  avatar_url: string | null
}

export interface Article {
  id: string
  title: string
  content: string
  excerpt: string | null
  created_at: string
  user_id: string
  profiles: Profile
  article_tags: ArticleTag[]
}

export interface EditorProps {
  content: string
  onChange: (newContent: string) => void
}
