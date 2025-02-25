export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          excerpt: string | null
          content: string
          created_at: string
          updated_at: string
          user_id: string
          published: boolean
        }
        Insert: {
          id?: string
          title: string
          excerpt?: string | null
          content: string
          created_at?: string
          updated_at?: string
          user_id: string
          published?: boolean
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string | null
          content?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          published?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
