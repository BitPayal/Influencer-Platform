-- Cehpoint Marketing Partners - Complete Database Setup with Test Data
-- Run this AFTER creating auth users in Supabase Authentication

-- Step 1: Create all tables (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('influencer', 'admin', 'marketing')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencers table
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  social_media_handles JSONB DEFAULT '{}'::jsonb,
  follower_count INTEGER DEFAULT 0,
  id_proof_url TEXT NOT NULL,
  id_proof_type TEXT NOT NULL CHECK (id_proof_type IN ('aadhaar', 'pan')),
  upi_id TEXT NOT NULL,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video submissions table
CREATE TABLE IF NOT EXISTS video_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  video_file_url TEXT,
  thumbnail_url TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  video_submission_id UUID REFERENCES video_submissions(id),
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_influencers_user_id ON influencers(user_id);
CREATE INDEX IF NOT EXISTS idx_influencers_approval_status ON influencers(approval_status);
CREATE INDEX IF NOT EXISTS idx_video_submissions_influencer_id ON video_submissions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_video_submissions_approval_status ON video_submissions(approval_status);
CREATE INDEX IF NOT EXISTS idx_payments_influencer_id ON payments(influencer_id);

-- Step 3: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_influencers_updated_at ON influencers;
CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_submissions_updated_at ON video_submissions;
CREATE TRIGGER update_video_submissions_updated_at BEFORE UPDATE ON video_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Influencers can view own profile" ON influencers;
DROP POLICY IF EXISTS "Influencers can insert own profile" ON influencers;
DROP POLICY IF EXISTS "Admins can view all influencers" ON influencers;
DROP POLICY IF EXISTS "Influencers can view own submissions" ON video_submissions;
DROP POLICY IF EXISTS "Influencers can create submissions" ON video_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON video_submissions;
DROP POLICY IF EXISTS "Influencers can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

-- Step 7: Create RLS policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Influencers can view own profile" ON influencers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Influencers can insert own profile" ON influencers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all influencers" ON influencers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
  );

CREATE POLICY "Influencers can view own submissions" ON video_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM influencers WHERE id = video_submissions.influencer_id AND user_id = auth.uid())
  );

CREATE POLICY "Influencers can create submissions" ON video_submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM influencers WHERE id = video_submissions.influencer_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all submissions" ON video_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
  );

CREATE POLICY "Influencers can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM influencers WHERE id = payments.influencer_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create test users in Supabase Authentication';
  RAISE NOTICE '2. Run the insert test data script';
END $$;
