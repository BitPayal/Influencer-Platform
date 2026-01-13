-- Fix missing columns in payments table
-- Run this in Supabase SQL Editor

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS task_assignment_id UUID REFERENCES task_assignments(id);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments';
