-- Cehpoint Marketing Partners - Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
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

-- Post proof table
CREATE TABLE IF NOT EXISTS post_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_submission_id UUID REFERENCES video_submissions(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'facebook', 'other')),
  post_url TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
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

-- Promotion guidelines table
CREATE TABLE IF NOT EXISTS promotion_guidelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  dos TEXT[] DEFAULT ARRAY[]::TEXT[],
  donts TEXT[] DEFAULT ARRAY[]::TEXT[],
  script_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_influencers_user_id ON influencers(user_id);
CREATE INDEX idx_influencers_approval_status ON influencers(approval_status);
CREATE INDEX idx_influencers_district ON influencers(district);
CREATE INDEX idx_video_submissions_influencer_id ON video_submissions(influencer_id);
CREATE INDEX idx_video_submissions_approval_status ON video_submissions(approval_status);
CREATE INDEX idx_payments_influencer_id ON payments(influencer_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_submissions_updated_at BEFORE UPDATE ON video_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_proofs_updated_at BEFORE UPDATE ON post_proofs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_guidelines_updated_at BEFORE UPDATE ON promotion_guidelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_guidelines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for influencers table
CREATE POLICY "Influencers can view own profile" ON influencers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Influencers can insert own profile" ON influencers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all influencers" ON influencers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'marketing')
    )
  );

-- RLS Policies for video_submissions table
CREATE POLICY "Influencers can view own submissions" ON video_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = video_submissions.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can create submissions" ON video_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM influencers WHERE id = video_submissions.influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all submissions" ON video_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'marketing')
    )
  );

-- RLS Policies for payments table
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

-- Create storage bucket for documents (run in Supabase Storage section)
-- Storage bucket: documents
-- Make it public or use RLS policies as needed

-- Insert a default admin user (update the email as needed)
-- You'll need to create this user in Supabase Auth first, then run:
-- INSERT INTO users (id, email, role) VALUES ('your-user-uuid', 'admin@example.com', 'admin');

-- NEW TABLES FOR PLATFORM EXPANSION --

-- Brands table (for users with 'marketing' role)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget DECIMAL(10, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'closed')),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Applications table
CREATE TABLE IF NOT EXISTS campaign_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id BIGINT REFERENCES influencers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'negotiating')),
  cover_message TEXT,
  bid_amount DECIMAL(10, 2),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_applications_updated_at BEFORE UPDATE ON campaign_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Brands
CREATE POLICY "Brands can view/edit own profile" ON brands
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Everyone can view brands" ON brands
  FOR SELECT USING (true);

-- RLS Policies for Campaigns
CREATE POLICY "Brands can manage own campaigns" ON campaigns
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view active campaigns" ON campaigns
  FOR SELECT USING (true);

-- RLS Policies for Campaign Applications
CREATE POLICY "Influencers can view/create own applications" ON campaign_applications
  USING (influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid()))
  WITH CHECK (influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid()));

CREATE POLICY "Brands can view applications for their campaigns" ON campaign_applications
  USING (campaign_id IN (SELECT id FROM campaigns WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())));

-- RLS Policies for Messages
CREATE POLICY "Users can view and create their own messages" ON messages
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id);

