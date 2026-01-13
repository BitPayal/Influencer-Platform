-- Add task_assignment_id to video_submissions table
-- Run this in Supabase SQL Editor

ALTER TABLE video_submissions 
ADD COLUMN IF NOT EXISTS task_assignment_id UUID REFERENCES task_assignments(id);
