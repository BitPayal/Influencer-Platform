-- Enhanced Database Schema for Cehpoint Marketing Platform
-- Run this SQL in your Supabase SQL Editor AFTER running database-schema.sql

-- Marketing Projects table
CREATE TABLE IF NOT EXISTS marketing_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_audience TEXT NOT NULL,
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  guidelines TEXT NOT NULL,
  sample_script TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Tasks table (Templates created by admin)
CREATE TABLE IF NOT EXISTS monthly_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES marketing_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  topic TEXT NOT NULL,
  guidelines TEXT NOT NULL,
  deliverables_required TEXT[] DEFAULT ARRAY[]::TEXT[],
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Assignments table (Connects tasks to influencers)
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES monthly_tasks(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  assigned_month TEXT NOT NULL,
  assigned_year INTEGER NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'completed', 'rejected')),
  submission_id UUID REFERENCES video_submissions(id),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, influencer_id, assigned_month, assigned_year)
);

-- Revenue Shares table (Enhanced payment tracking)
CREATE TABLE IF NOT EXISTS revenue_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  follower_band TEXT NOT NULL CHECK (follower_band IN ('0-5k', '5k-25k', '25k-100k', '100k+')),
  fixed_payout DECIMAL(10, 2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  revenue_from_leads DECIMAL(10, 2) DEFAULT 0,
  performance_share_percentage DECIMAL(5, 2) DEFAULT 5.00,
  performance_share_amount DECIMAL(10, 2) DEFAULT 0,
  total_earning DECIMAL(10, 2) DEFAULT 0,
  videos_approved INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'calculated', 'paid')),
  payment_id UUID REFERENCES payments(id),
  calculated_at TIMESTAMPTZ,
  calculated_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(influencer_id, month, year)
);

-- Guidebook Resources table
CREATE TABLE IF NOT EXISTS guidebook_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'video', 'image', 'document')),
  file_size INTEGER,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'training', 'guidelines', 'examples')),
  is_active BOOLEAN DEFAULT TRUE,
  access_level TEXT DEFAULT 'all' CHECK (access_level IN ('all', 'influencer', 'admin')),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update payments table to add new columns for revenue tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS follower_band TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS lead_revenue DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS performance_share DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS task_assignment_id UUID REFERENCES task_assignments(id);

-- Update video_submissions to link with task assignments
ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS task_assignment_id UUID REFERENCES task_assignments(id);

-- Create indexes for new tables
CREATE INDEX idx_marketing_projects_is_active ON marketing_projects(is_active);
CREATE INDEX idx_monthly_tasks_month_year ON monthly_tasks(month, year);
CREATE INDEX idx_monthly_tasks_project_id ON monthly_tasks(project_id);
CREATE INDEX idx_task_assignments_influencer_id ON task_assignments(influencer_id);
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_status ON task_assignments(status);
CREATE INDEX idx_task_assignments_month_year ON task_assignments(assigned_month, assigned_year);
CREATE INDEX idx_revenue_shares_influencer_id ON revenue_shares(influencer_id);
CREATE INDEX idx_revenue_shares_month_year ON revenue_shares(month, year);
CREATE INDEX idx_revenue_shares_payment_status ON revenue_shares(payment_status);
CREATE INDEX idx_guidebook_resources_is_active ON guidebook_resources(is_active);
CREATE INDEX idx_guidebook_resources_category ON guidebook_resources(category);

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_marketing_projects_updated_at BEFORE UPDATE ON marketing_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_tasks_updated_at BEFORE UPDATE ON monthly_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_assignments_updated_at BEFORE UPDATE ON task_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_shares_updated_at BEFORE UPDATE ON revenue_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidebook_resources_updated_at BEFORE UPDATE ON guidebook_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on new tables
ALTER TABLE marketing_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidebook_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_projects
CREATE POLICY "Everyone can view active marketing projects" ON marketing_projects
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage marketing projects" ON marketing_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for monthly_tasks
CREATE POLICY "Influencers can view their assigned tasks" ON monthly_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM task_assignments ta
      JOIN influencers i ON ta.influencer_id = i.id
      WHERE ta.task_id = monthly_tasks.id AND i.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage monthly tasks" ON monthly_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for task_assignments
CREATE POLICY "Influencers can view own task assignments" ON task_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = task_assignments.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can update own task assignments status" ON task_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = task_assignments.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all task assignments" ON task_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for revenue_shares
CREATE POLICY "Influencers can view own revenue shares" ON revenue_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = revenue_shares.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all revenue shares" ON revenue_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for guidebook_resources
CREATE POLICY "Users can view guidebooks based on access level" ON guidebook_resources
  FOR SELECT USING (
    is_active = TRUE AND (
      access_level = 'all'
      OR (access_level = 'influencer' AND EXISTS (SELECT 1 FROM influencers WHERE user_id = auth.uid()))
      OR (access_level = 'admin' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Admins can manage guidebook resources" ON guidebook_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate revenue share automatically
CREATE OR REPLACE FUNCTION calculate_revenue_share(
  p_influencer_id UUID,
  p_month TEXT,
  p_year INTEGER
) RETURNS revenue_shares AS $$
DECLARE
  v_revenue_share revenue_shares;
  v_follower_count INTEGER;
  v_follower_band TEXT;
  v_fixed_payout DECIMAL(10, 2);
  v_approved_videos INTEGER;
BEGIN
  -- Get influencer's follower count
  SELECT follower_count INTO v_follower_count
  FROM influencers WHERE id = p_influencer_id;
  
  -- Determine follower band and fixed payout
  IF v_follower_count >= 100000 THEN
    v_follower_band := '100k+';
    v_fixed_payout := 10000.00;
  ELSIF v_follower_count >= 25000 THEN
    v_follower_band := '25k-100k';
    v_fixed_payout := 7000.00;
  ELSIF v_follower_count >= 5000 THEN
    v_follower_band := '5k-25k';
    v_fixed_payout := 4000.00;
  ELSE
    v_follower_band := '0-5k';
    v_fixed_payout := 2000.00;
  END IF;
  
  -- Count approved videos for the month
  SELECT COUNT(*) INTO v_approved_videos
  FROM video_submissions vs
  JOIN task_assignments ta ON vs.task_assignment_id = ta.id
  WHERE ta.influencer_id = p_influencer_id
    AND vs.approval_status = 'approved'
    AND ta.assigned_month = p_month
    AND ta.assigned_year = p_year;
  
  -- Insert or update revenue share record
  INSERT INTO revenue_shares (
    influencer_id,
    month,
    year,
    follower_band,
    fixed_payout,
    videos_approved,
    performance_share_percentage,
    payment_status
  ) VALUES (
    p_influencer_id,
    p_month,
    p_year,
    v_follower_band,
    v_fixed_payout * v_approved_videos,
    v_approved_videos,
    5.00,
    'calculated'
  )
  ON CONFLICT (influencer_id, month, year)
  DO UPDATE SET
    follower_band = EXCLUDED.follower_band,
    fixed_payout = EXCLUDED.fixed_payout,
    videos_approved = EXCLUDED.videos_approved,
    calculated_at = NOW()
  RETURNING * INTO v_revenue_share;
  
  RETURN v_revenue_share;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE marketing_projects IS 'Stores marketing projects and campaigns that tasks are created from';
COMMENT ON TABLE monthly_tasks IS 'Monthly tasks/topics created by admin for influencers to complete';
COMMENT ON TABLE task_assignments IS 'Connects monthly tasks to specific influencers with tracking';
COMMENT ON TABLE revenue_shares IS 'Enhanced payment tracking with follower bands and performance metrics';
COMMENT ON TABLE guidebook_resources IS 'Stores guidebooks, training materials, and resources for influencers';
