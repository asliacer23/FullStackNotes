import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Note } from '../lib/database';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onNoteCreate: (date: string) => void;
  notes: Note[];
}

export const Calendar = ({ selectedDate, onDateSelect, onNoteCreate, notes }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's trailing days
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    });
  }

  // Next month's leading days
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
    });
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Filter notes for a specific day
  const getDayNotes = (date: Date) => {
    const dateString = formatDateString(date);
    return notes.filter(note => note.date === dateString);
  };

  const getCategoryDot = (notes: Note[]) => {
    if (notes.length === 0) return null;
    const categories = [...new Set(notes.map(note => note.category))].slice(0, 3);
    return (
      <div className="flex gap-1 mt-1 justify-center">
        {categories.map(category => (
          <div
            key={category}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              category === 'work' && "bg-category-work",
              category === 'personal' && "bg-category-personal", 
              category === 'health' && "bg-category-health",
              category === 'finance' && "bg-category-finance",
              category === 'food' && "bg-category-food"
            )}
          />
        ))}
        {notes.length > 3 && (
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((calendarDay, index) => {
          const dateString = formatDateString(calendarDay.date);
          const dayNotes = getDayNotes(calendarDay.date);
          const isToday = dateString === todayString;
          const isSelected = dateString === selectedDate;

          return (
            <div
              key={index}
              className={cn(
                "relative group min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-calendar-hover hover:shadow-soft",
                !calendarDay.isCurrentMonth && "text-muted-foreground bg-muted/30",
                isToday && "bg-gradient-primary-soft border-primary",
                isSelected && "bg-calendar-selected border-primary shadow-purple",
                calendarDay.isCurrentMonth && "hover:border-primary/50"
              )}
              onClick={() => onDateSelect(dateString)}
            >
              {/* Day Number */}
              <div className={cn(
                "text-sm font-medium",
                isToday && "text-primary font-bold"
              )}>
                {calendarDay.day}
              </div>

              {/* Category Dots */}
              {getCategoryDot(dayNotes)}

              {/* Note Count Badge */}
              {dayNotes.length > 0 && (
                <div className="absolute top-1 right-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {dayNotes.length}
                </div>
              )}

              {/* Quick Add Button (appears on hover) */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteCreate(dateString);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};