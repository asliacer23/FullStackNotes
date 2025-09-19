import { useState, useEffect } from 'react';
import { X, Save, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Note, CategoryType } from '../lib/database';
import { cn } from '@/lib/utils';

// Define ChecklistItem type locally if not in database.ts
export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

// Example categories array (replace with your real categories if needed)
const categories: { id: CategoryType; name: string; emoji: string; color: string }[] = [
  { id: 'work', name: 'Work', emoji: '💼', color: '#7C3AED' },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#F59E42' },
  { id: 'health', name: 'Health', emoji: '💪', color: '#10B981' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#FBBF24' },
  { id: 'food', name: 'Food', emoji: '🍔', color: '#EF4444' },
];

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  defaultDate?: string;
}

export const NoteEditor = ({ note, isOpen, onClose, onSave, defaultDate }: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('personal');
  const [date, setDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [pinned, setPinned] = useState(false);

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setDate(note.date);
      setTags(note.tags);
      setChecklist((note as any).checklist || []);
      setPinned(note.pinned);
    } else {
      setTitle('');
      setContent('');
      setCategory('personal');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setTags([]);
      setChecklist([]);
      setPinned(false);
    }
  }, [note, defaultDate]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const noteData: Note = {
      id: note?.id || crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      date,
      category,
      tags,
      checklist: checklist.length > 0 ? checklist : undefined,
      pinned,
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(noteData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: '',
      completed: false,
    };
    setChecklist([...checklist, newItem]);
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const selectedCategory = categories.find(cat => cat.id === category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{note ? 'Edit Note' : 'Create New Note'}</span>
            {selectedCategory && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
                style={{ borderColor: selectedCategory.color }}
              >
                <span>{selectedCategory.emoji}</span>
                <span>{selectedCategory.name}</span>
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here... (Markdown supported)"
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown formatting (headers, bold, italic, lists, etc.)
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Checklist</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChecklistItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {checklist.length > 0 && (
              <Card className="p-3 space-y-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateChecklistItem(item.id, { completed: !item.completed })}
                    >
                      <Check className={cn(
                        "h-4 w-4",
                        item.completed ? "text-primary" : "text-muted-foreground"
                      )} />
                    </Button>
                    <Input
                      value={item.text}
                      onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
                      placeholder="Checklist item..."
                      className={cn(
                        "text-sm",
                        item.completed && "line-through text-muted-foreground"
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeChecklistItem(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tags</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="text-sm"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <span>{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant={pinned ? "default" : "outline"}
              onClick={() => setPinned(!pinned)}
              className="flex items-center gap-2"
            >
              <span className={pinned ? "fill-current" : ""}>📌</span>
              {pinned ? 'Pinned' : 'Pin Note'}
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {note ? 'Update Note' : 'Create Note'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};