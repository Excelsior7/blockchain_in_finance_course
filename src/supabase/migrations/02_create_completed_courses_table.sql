-- Create a table for completed courses
CREATE TABLE IF NOT EXISTS completed_courses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id INTEGER NOT NULL,
  tx_hash TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE completed_courses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own completed courses
CREATE POLICY "Users can view own completed courses" ON completed_courses
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own completed courses
CREATE POLICY "Users can insert own completed courses" ON completed_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS completed_courses_user_id_idx ON completed_courses (user_id); 