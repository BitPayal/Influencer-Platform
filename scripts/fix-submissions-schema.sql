-- Fix task_assignment_id type in video_submissions
-- Run this in Supabase SQL Editor

-- 1. Drop the incorrect column (if it exists as BIGINT or other type)
ALTER TABLE video_submissions 
DROP COLUMN IF EXISTS task_assignment_id;

-- 2. Re-add the column as UUID (referencing task_assignments.id which is UUID)
ALTER TABLE video_submissions 
ADD COLUMN task_assignment_id UUID REFERENCES task_assignments(id);
