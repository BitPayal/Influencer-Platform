-- Add missing columns to task_assignments
-- Run this in Supabase SQL Editor

ALTER TABLE task_assignments 
ADD COLUMN IF NOT EXISTS assigned_month TEXT,
ADD COLUMN IF NOT EXISTS assigned_year INTEGER;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'task_assignments';
