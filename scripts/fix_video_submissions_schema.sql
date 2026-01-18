-- Fix mismatch between video_submissions.task_assignment_id (UUID) and task_assignments.id (likely BigInt/Integer)

-- 1. Drop the constraint if it exists (it might not if types were mismatched, but just in case)
-- ALTER TABLE video_submissions DROP CONSTRAINT IF EXISTS video_submissions_task_assignment_id_fkey;

-- 2. Alter the column type to BIGINT (or INTEGER if preferred, but BIGINT covers both)
-- We cast to text first to avoid UUID cast errors, then to BIGINT (ignoring existing UUID values if any, as they are likely invalid)

ALTER TABLE video_submissions 
ALTER COLUMN task_assignment_id TYPE BIGINT 
USING (
  CASE 
    WHEN task_assignment_id::text ~ '^[0-9]+$' THEN task_assignment_id::text::bigint 
    ELSE NULL 
  END
);

-- 3. Add Foreign Key constraint (Assuming task_assignments.id is BIGINT)
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_assignments') THEN
--         ALTER TABLE video_submissions 
--         ADD CONSTRAINT video_submissions_task_assignment_id_fkey 
--         FOREIGN KEY (task_assignment_id) REFERENCES task_assignments(id);
--     END IF;
-- END $$;
