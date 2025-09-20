import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Note } from '../lib/database';

interface NoteViewModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteViewModal = ({ note, isOpen, onClose }: NoteViewModalProps) => {
  if (!note) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-muted-foreground">
          <span>{note.category}</span> • <span>{note.date}</span>
        </div>
        <div className="whitespace-pre-line">{note.content}</div>
        {/* Optionally show tags, checklist, etc. */}
      </DialogContent>
    </Dialog>
  );
};