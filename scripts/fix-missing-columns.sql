-- Fix missing columns in video_submissions table
-- Run this in Supabase SQL Editor

ALTER TABLE video_submissions 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

ALTER TABLE video_submissions 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'video_submissions';
