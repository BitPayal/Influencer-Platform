-- Comprehensive Fix: Create missing task_assignments table and update payments
-- Run this entire script in Supabase SQL Editor

-- 1. Create task_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  influencer_id BIGINT REFERENCES influencers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'submitted', 'completed', 'rejected')),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS for task_assignments
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS Policies for task_assignments
-- Influencers can view their own assignments
CREATE POLICY "Influencers can view own assignments" ON task_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = task_assignments.influencer_id AND user_id = auth.uid()
    )
  );

-- Admins can view/manage all assignments
CREATE POLICY "Admins can manage all assignments" ON task_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Influencers can update their own assignments (e.g. to set status to submitted)
CREATE POLICY "Influencers can update own assignments" ON task_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = task_assignments.influencer_id AND user_id = auth.uid()
    )
  );

-- 4. NOW add the column to payments (this previously failed because table didn't exist)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS task_assignment_id UUID REFERENCES task_assignments(id);

-- 5. Trigger for updated_at
CREATE TRIGGER update_task_assignments_updated_at BEFORE UPDATE ON task_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
