# Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

## Step 2: Update Configuration

Replace the credentials in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'https://your-project-id.supabase.co'  // Your Project URL
const supabaseAnonKey = 'your-anon-key-here'  // Your anon/public key
```

## Step 3: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) -- Optional: for multi-user support
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed)
CREATE POLICY "Enable all access for all users" ON notes
FOR ALL USING (true);
```

## Step 4: Install Supabase Client

Add the Supabase dependency:

```bash
npm install @supabase/supabase-js
```

## Step 5: Update Your Components

Replace mock data usage in your components with the database functions:

- Import from `src/lib/database.ts` instead of `src/lib/mock-data.ts`
- Use `getAllNotes()`, `createNote()`, `updateNote()`, `deleteNote()` functions
- Handle async operations with proper loading states

## Step 6: Test the Connection

1. Update the credentials in `supabase.ts`
2. Create the database table using the SQL above
3. The app should now store data in your Supabase database!

## Optional: Add Authentication

If you want user-specific notes, enable authentication in Supabase and add user context to your app.

---

**Recommended:** Use Lovable's native Supabase integration by clicking the green Supabase button instead of manual setup!