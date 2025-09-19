import { useState } from 'react';
import { Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CategoryType, Note } from '../lib/database';
import { cn } from '@/lib/utils';


interface CategoryStat {
  id: CategoryType;
  name: string;
  emoji: string;
  count: number;
}

interface CategoryDef {
  id: CategoryType;
  name: string;
  emoji: string;
  color: string;
}

interface NoteSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryType | null;
  onCategorySelect: (category: CategoryType | null) => void;
  notes: Note[];
  categories: CategoryDef[];
  className?: string;
}

function getCategoryStats(notes: Note[], categories: CategoryDef[]): CategoryStat[] {
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji,
    count: notes.filter(note => note.category === cat.id).length,
  }));
}

function getThisWeekNotes(notes: Note[]): number {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  return notes.filter(note => {
    const noteDate = new Date(note.date);
    return noteDate >= weekAgo && noteDate <= now;
  }).length;
}

function getCompletedTasks(notes: Note[]): number {
  return notes.reduce((sum, note) => {
    if (note.checklist && Array.isArray(note.checklist)) {
      return sum + note.checklist.filter(item => item.completed).length;
    }
    return sum;
  }, 0);
}

// Get recent activity from notes (last 5 actions)
function getRecentActivity(notes: Note[], categories: CategoryDef[]) {
  // Sort by updatedAt descending
  const sorted = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return sorted.slice(0, 5).map(note => {
    const category = categories.find(cat => cat.id === note.category);
    let action = "Updated";
    if (note.createdAt === note.updatedAt) action = "Created";
    if (note.checklist && note.checklist.some(item => item.completed)) action = "Completed checklist";
    return {
      id: note.id,
      title: note.title,
      action,
      time: timeAgo(note.updatedAt),
      color: category?.color || "#6366f1"
    };
  });
}

// Helper to format time ago
function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const NoteSidebar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  notes,
  categories,
  className
}: NoteSidebarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const categoryStats = getCategoryStats(notes, categories);
  const totalNotes = notes.length;
  const thisWeekNotes = getThisWeekNotes(notes);
  const completedTasks = getCompletedTasks(notes);
  const recentActivity = getRecentActivity(notes, categories);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-start"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Quick Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Notes</span>
            <span className="font-medium">{totalNotes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">This Week</span>
            <span className="font-medium">{thisWeekNotes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tasks Done</span>
            <span className="font-medium">{completedTasks}</span>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-1">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-between"
            onClick={() => onCategorySelect(null)}
          >
            <span>All Categories</span>
            <Badge variant="secondary" className="ml-2">
              {totalNotes}
            </Badge>
          </Button>
          
          <Separator className="my-2" />
          
          {categoryStats.map((stat) => {
            const isSelected = selectedCategory === stat.id;
            return (
              <Button
                key={stat.id}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-between"
                onClick={() => onCategorySelect(stat.id)}
              >
                <span className="flex items-center gap-2">
                  <span>{stat.emoji}</span>
                  <span>{stat.name}</span>
                </span>
                <Badge 
                  variant={isSelected ? "default" : "secondary"} 
                  className="ml-2"
                >
                  {stat.count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          {recentActivity.length === 0 && (
            <div className="text-muted-foreground">No recent activity.</div>
          )}
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: activity.color }}
              />
              <div>
                <p className="text-foreground">
                  {activity.action} "{activity.title}"
                </p>
                <p className="text-muted-foreground text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};