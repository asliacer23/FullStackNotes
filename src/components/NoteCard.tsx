import { Pin, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Note } from '../lib/database';
import { cn } from '@/lib/utils';

// Example categories array (replace with your real categories if needed)
const categories = [
  { id: 'work', name: 'Work', emoji: '💼', color: '#7C3AED' },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#F59E42' },
  { id: 'health', name: 'Health', emoji: '💪', color: '#10B981' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#FBBF24' },
  { id: 'food', name: 'Food', emoji: '🍔', color: '#EF4444' },
];

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onPin: (noteId: string) => void;
  onView?: (note: Note) => void; // <-- add this
  compact?: boolean;
}

export const NoteCard = ({ note, onEdit, onDelete, onPin, onView, compact = false }: NoteCardProps) => {
  const category = categories.find(cat => cat.id === note.category);

  const getContentPreview = (content: string, maxLength: number = 120) => {
    const plainText = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/\n\s*\n/g, ' ')
      .replace(/\n/g, ' ')
      .trim();

    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const completedTasks = (note as any).checklist?.filter((item: any) => item.completed).length || 0;
  const totalTasks = (note as any).checklist?.length || 0;

  return (
    <Card
      className={cn(
        "p-4 hover:shadow-medium transition-all duration-200 cursor-pointer group",
        compact ? "p-3" : "p-4"
      )}
      onClick={() => onView && onView(note)} // <-- add this
    >
      <div className="flex items-start gap-3">
        {/* Category Indicator */}
        <div className="flex-shrink-0 mt-1">
          <div
            className="w-3 h-3 rounded-full border-2 border-white shadow-soft"
            style={{ backgroundColor: category?.color }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-semibold text-foreground truncate",
                  compact ? "text-sm" : "text-base"
                )}>
                  {note.title}
                </h3>
                {note.pinned && (
                  <Pin className="h-4 w-4 text-primary fill-current flex-shrink-0" />
                )}
              </div>

              {/* Category and Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span>{category?.emoji}</span>
                  <span>{category?.name}</span>
                </span>
                <span>•</span>
                <span>{formatDate(note.date)}</span>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin(note.id)}>
                  <Pin className="h-4 w-4 mr-2" />
                  {note.pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(note.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Preview */}
          <p className={cn(
            "text-muted-foreground leading-relaxed",
            compact ? "text-xs" : "text-sm"
          )}>
            {getContentPreview(note.content, compact ? 80 : 120)}
          </p>

          {/* Tags and Checklist Progress */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "text-xs px-2 py-0.5",
                    compact && "text-xs px-1.5 py-0.5"
                  )}
                >
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Checklist Progress */}
            {totalTasks > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/30">
                    <div
                      className="w-full h-full rounded-full bg-primary transition-all duration-300"
                      style={{ transform: `scaleX(${completedTasks / totalTasks})` }}
                    />
                  </div>
                  <span>{completedTasks}/{totalTasks}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};