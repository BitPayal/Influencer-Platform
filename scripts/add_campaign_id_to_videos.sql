-- Add campaign_id to video_submissions table
ALTER TABLE video_submissions 
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_video_submissions_campaign_id ON video_submissions(campaign_id);

-- Comment
COMMENT ON COLUMN video_submissions.campaign_id IS 'Link to the campaign this video was submitted for';
