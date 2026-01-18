-- Add influencer_task_id to video_submissions to support BigInt task IDs from influencer_tasks table
ALTER TABLE video_submissions 
ADD COLUMN IF NOT EXISTS influencer_task_id BIGINT;

-- Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'video_submissions_influencer_task_id_fkey') THEN
        ALTER TABLE video_submissions 
        ADD CONSTRAINT video_submissions_influencer_task_id_fkey 
        FOREIGN KEY (influencer_task_id) REFERENCES influencer_tasks(id);
    END IF;
END $$;
