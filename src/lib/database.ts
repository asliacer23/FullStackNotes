import { supabase } from './supabase'

// Add type definitions if not imported elsewhere
export type CategoryType = 'work' | 'personal' | 'health' | 'finance' | 'food'

export interface Note {
  id: string
  title: string
  content: string
  date: string
  category: CategoryType
  tags: string[]
  checklist?: { id: string; text: string; completed: boolean }[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

// Notes CRUD operations
export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      title: note.title,
      content: note.content,
      date: note.date,
      category: note.category,
      tags: note.tags,
      pinned: note.pinned
    })
    .select()
    .single()

  if (error || !data) {
    console.error('Error creating note:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    date: data.date,
    category: data.category as CategoryType,
    tags: data.tags || [],
    pinned: data.pinned || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function getAllNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching notes:', error)
    return []
  }

  return data.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    date: note.date,
    category: note.category as CategoryType,
    tags: note.tags || [],
    pinned: note.pinned || false,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  }))
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .update({
      title: updates.title,
      content: updates.content,
      date: updates.date,
      category: updates.category,
      tags: updates.tags,
      pinned: updates.pinned,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating note:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    date: data.date,
    category: data.category as CategoryType,
    tags: data.tags || [],
    pinned: data.pinned || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting note:', error)
    return false
  }

  return true
}

export async function searchNotes(query: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })

  if (error || !data) {
    console.error('Error searching notes:', error)
    return []
  }

  return data.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    date: note.date,
    category: note.category as CategoryType,
    tags: note.tags || [],
    pinned: note.pinned || false,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  }))
}

export const categories = [
  { id: 'work', name: 'Work', emoji: '💼', color: '#7C3AED' },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#F59E42' },
  { id: 'health', name: 'Health', emoji: '💪', color: '#10B981' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#FBBF24' },
  { id: 'food', name: 'Food', emoji: '🍔', color: '#EF4444' },
];

// Example notes array (replace with your real data source)
export const notes: Note[] = [
  // ...your notes here
]