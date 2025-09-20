import { useState, useEffect } from 'react';
import { Plus, CalendarDays, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/Calendar';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditor } from '@/components/NoteEditor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAllNotes, createNote, updateNote, deleteNote, searchNotes } from '../lib/database'
import type { Note, CategoryType } from '../lib/database'
import { categories } from '../lib/database';
import { cn } from '@/lib/utils';

import { NoteSidebar } from '@/components/NoteSidebar';
import { NoteViewModal } from '@/components/NoteViewModal';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [editorNote, setEditorNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [defaultEditorDate, setDefaultEditorDate] = useState<string | undefined>();
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Fetch notes from Supabase on mount and when search/category/date changes
  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      let result: Note[] = [];
      if (searchQuery) {
        result = await searchNotes(searchQuery);
      } else {
        result = await getAllNotes();
      }
      // Filter by category and date after fetching
      if (selectedCategory) {
        result = result.filter(note => note.category === selectedCategory);
      }
      if (selectedDate) {
        result = result.filter(note => note.date === selectedDate);
      }
      // Sort by pinned first, then by updated date
      result = result.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setNotes(result);
      setLoading(false);
    }
    fetchNotes();
  }, [searchQuery, selectedCategory, selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  const handleNoteCreate = (date?: string) => {
    setEditorNote(null);
    // Use the provided date, or the currently selected date, or today
    setDefaultEditorDate(date || selectedDate || new Date().toISOString().split('T')[0]);
    setIsEditorOpen(true);
  };

  const handleNoteEdit = (note: Note) => {
    setEditorNote(note);
    setDefaultEditorDate(note.date);
    setIsEditorOpen(true);
  };

  const handleNoteDelete = async (noteId: string) => {
    setLoading(true);
    const success = await deleteNote(noteId);
    if (success) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
    setLoading(false);
  };

  const handleNotePin = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setLoading(true);
    const updated = await updateNote(noteId, { pinned: !note.pinned });
    if (updated) {
      setNotes(notes.map(n => n.id === noteId ? updated : n));
    }
    setLoading(false);
  };

  const handleNoteSave = async (noteData: Note) => {
    setLoading(true);
    if (editorNote) {
      // Update existing note
      const updated = await updateNote(noteData.id, noteData);
      if (updated) {
        setNotes(notes.map(note => note.id === noteData.id ? updated : note));
      }
    } else {
      // Create new note
      const created = await createNote(noteData);
      if (created) {
        setNotes([created, ...notes]);
      }
    }
    setIsEditorOpen(false);
    setLoading(false);
  };

  const handleNoteView = (note: Note) => {
    setViewNote(note);
    setIsViewOpen(true);
  };

  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Personal Notes Calendar
              </h1>
              <p className="text-muted-foreground text-sm">
                Organize your thoughts and stay productive
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                onClick={() => handleNoteCreate()}
                className="bg-gradient-primary hover:opacity-90 shadow-purple"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <NoteSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              notes={notes}
              categories={categories}
            />
          </div>

          {/* Calendar */}
          <div className="lg:col-span-6">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onNoteCreate={handleNoteCreate} // Calendar should call handleNoteCreate(date)
              notes={notes}
            />
          </div>

          {/* Notes Panel */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Notes Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {selectedDate ? (
                    <>
                      <CalendarDays className="h-5 w-5" />
                      Notes for {formatSelectedDate(selectedDate).split(',')[0]}
                    </>
                  ) : (
                    <>
                      <StickyNote className="h-5 w-5" />
                      {searchQuery ? 'Search Results' : 
                       selectedCategory ? `${selectedCategory} Notes` : 'All Notes'}
                    </>
                  )}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                ) : notes.length > 0 ? (
                  notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleNoteEdit}
                      onDelete={handleNoteDelete}
                      onPin={handleNotePin}
                      onView={handleNoteView} // <-- pass this
                      compact={true}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {selectedDate 
                        ? 'No notes for this date'
                        : searchQuery 
                        ? 'No notes match your search'
                        : 'No notes found'
                      }
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNoteCreate(selectedDate || undefined)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Editor Modal */}
      <NoteEditor
        note={editorNote}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleNoteSave}
        defaultDate={defaultEditorDate}
      />

      {/* Note View Modal */}
      <NoteViewModal
        note={viewNote}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
    </div>
  );
};

export default Index;