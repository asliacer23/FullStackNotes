import { createClient } from '@supabase/supabase-js'

// Use Vite environment variables (for Netlify and local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string
          date: string
          category: string
          tags: string[]
          pinned: boolean
          created_at: string
          updated_at: string
          user_id?: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          date: string
          category: string
          tags?: string[]
          pinned?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          date?: string
          category?: string
          tags?: string[]
          pinned?: boolean
          updated_at?: string
        }
      }
    }
  }
}