import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://shyfhwipqiwtyatficww.supabase.co'  // e.g., 'https://your-project.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeWZod2lwcWl3dHlhdGZpY3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODY5NzksImV4cCI6MjA3Mzg2Mjk3OX0.hxjf8waqPAbjLuDgH9z867XUxxqlrxHtA5FTfbEL7i4'  // Your project's anon/public key

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