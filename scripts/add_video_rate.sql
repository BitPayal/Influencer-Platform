-- Add video_rate column to influencers table
ALTER TABLE influencers 
ADD COLUMN IF NOT EXISTS video_rate INTEGER DEFAULT 0;

-- Comment on column
COMMENT ON COLUMN influencers.video_rate IS 'Fixed payment rate per approved video (₹2000 - ₹10000)';

-- Create revenue_shares table if not exists
CREATE TABLE IF NOT EXISTS revenue_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  follower_band TEXT,
  fixed_payout DECIMAL(10, 2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  revenue_from_leads DECIMAL(10, 2) DEFAULT 0,
  performance_share_percentage DECIMAL(5, 2) DEFAULT 5.0,
  performance_share_amount DECIMAL(10, 2) DEFAULT 0,
  total_earning DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'calculated', 'paid')),
  payment_id UUID REFERENCES payments(id),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE revenue_shares ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Influencers can view own revenue shares" ON revenue_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = revenue_shares.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage revenue shares" ON revenue_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

