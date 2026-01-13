-- Create revenue_shares table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS revenue_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id BIGINT REFERENCES influencers(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  revenue_from_leads DECIMAL(10, 2) DEFAULT 0,
  performance_share_amount DECIMAL(10, 2) DEFAULT 0,
  total_earning DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE revenue_shares ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all
CREATE POLICY "Admins can manage revenue shares" ON revenue_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow influencers to view their own
CREATE POLICY "Influencers can view own revenue shares" ON revenue_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = revenue_shares.influencer_id AND user_id = auth.uid()
    )
  );
