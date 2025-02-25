export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          published: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          created_at: string
          user_id: string
          article_id: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          updated_at: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
      }
      article_tags: {
        Row: {
          id: string
          article_id: string
          tag_id: string
          created_at: string
        }
      }
    }
  }
}
