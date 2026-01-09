-- Auto-approve migration
-- 1. Change default value for new influencers
ALTER TABLE influencers 
ALTER COLUMN approval_status SET DEFAULT 'approved';

-- 2. Update existing pending influencers to approved
UPDATE influencers 
SET approval_status = 'approved', approved_at = NOW() 
WHERE approval_status = 'pending';
