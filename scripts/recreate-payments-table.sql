-- Recreate payments table with correct types (BIGINT for influencer_id)
-- Run this in Supabase SQL Editor

-- 1. Drop existing payments table (WARNING: This deletes payment history)
DROP TABLE IF EXISTS payments CASCADE;

-- 2. Create payments table with correct schema
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id BIGINT REFERENCES influencers(id) ON DELETE CASCADE,
  video_submission_id BIGINT REFERENCES video_submissions(id),
  task_assignment_id UUID REFERENCES task_assignments(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('fixed', 'revenue_share')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'under_review')),
  upi_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES users(id),
  month TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Re-add Policies
CREATE POLICY "Influencers can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = payments.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
