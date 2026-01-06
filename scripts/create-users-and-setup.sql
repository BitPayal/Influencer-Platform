-- Complete Setup Script for Cehpoint Influence Partners Platform
-- This script creates demo admin and influencer accounts with predefined credentials
-- Run this AFTER creating the users in Supabase Authentication

-- IMPORTANT: First, create these users in Supabase Authentication panel:
-- Admin: admin@cehpoint.com / Cehpoint@2025
-- Influencer: influencer@cehpoint.com / Influencer@2025
-- Copy their UUIDs and replace the placeholders below

-- ============================================================================
-- STEP 1: Insert demo users (replace UUIDs with actual ones from Supabase Auth)
-- ============================================================================

-- Insert admin user metadata
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES 
  ('ADMIN-UUID-HERE', 'admin@cehpoint.com', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert influencer user metadata
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES 
  ('INFLUENCER-UUID-HERE', 'influencer@cehpoint.com', 'influencer', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- ============================================================================
-- STEP 2: Create influencer profile
-- ============================================================================

INSERT INTO influencers (
  user_id,
  full_name,
  phone_number,
  email,
  district,
  state,
  social_media_handles,
  follower_count,
  id_proof_url,
  id_proof_type,
  upi_id,
  approval_status,
  approved_at,
  approved_by
)
VALUES (
  'INFLUENCER-UUID-HERE',
  'Demo Influencer',
  '+91-9876543210',
  'influencer@cehpoint.com',
  'Bangalore Urban',
  'Karnataka',
  '{"instagram": "demo_influencer", "youtube": "DemoChannel"}'::jsonb,
  35000, -- 25k-100k band = ₹7,000 per video
  'https://example.com/demo-id.pdf',
  'aadhaar',
  'demo@upi',
  'approved',
  NOW(),
  'ADMIN-UUID-HERE'
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  follower_count = EXCLUDED.follower_count,
  approval_status = EXCLUDED.approval_status;

-- ============================================================================
-- STEP 3: Create marketing projects
-- ============================================================================

INSERT INTO marketing_projects (
  title,
  description,
  objectives,
  target_audience,
  deliverables,
  guidelines,
  sample_script,
  is_active,
  created_by
)
VALUES 
  (
    'Digital India IT Services Campaign',
    'Promote local IT service providers and digital transformation solutions across India',
    ARRAY['Increase awareness of Indian IT companies', 'Generate leads for software services', 'Build trust in local tech solutions'],
    'Small business owners, startups, entrepreneurs, students',
    ARRAY['1 main video (60-90 seconds)', '2 story posts', 'Community engagement'],
    'Focus on real benefits, success stories, and local impact. Use regional language when appropriate. Highlight Indian companies and self-reliance.',
    'Script: "Did you know Indian IT companies can provide world-class solutions right here in [your city]? From custom software to cloud services, support local tech and empower Digital India!"',
    true,
    'ADMIN-UUID-HERE'
  ),
  (
    'EdTech & Skill Development Awareness',
    'Promote online learning platforms and skill development opportunities for rural and semi-urban youth',
    ARRAY['Reduce unemployment through upskilling', 'Promote affordable education tech', 'Encourage digital literacy'],
    'Students, job seekers, parents in tier 2/3 cities',
    ARRAY['1 video showcasing platform benefits', '1 success story', 'Q&A session'],
    'Emphasize affordability, accessibility, and real outcomes. Share success stories of people from similar backgrounds.',
    'Script: "Education shouldn''t depend on where you live. These EdTech platforms offer courses in [language] that can help you get a job in tech, business, or healthcare - starting today!"',
    true,
    'ADMIN-UUID-HERE'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Create monthly tasks
-- ============================================================================

INSERT INTO monthly_tasks (
  title,
  description,
  topic,
  guidelines,
  deliverables_required,
  month,
  year,
  is_default,
  created_by
)
VALUES 
  (
    'Promote EdTech Platforms in Your Region',
    'Create awareness about affordable online learning and skill development platforms that can help local youth get jobs',
    'edtech',
    'Focus on platforms offering courses in regional languages. Highlight success stories, affordability (under ₹500/month plans), and job placement support. Show how technology can bridge the education gap.',
    ARRAY['1 video post (60-90 seconds)', '2 Instagram stories', 'Engage with 10+ comments'],
    'November',
    2025,
    true,
    'ADMIN-UUID-HERE'
  ),
  (
    'Showcase AgriTech Solutions for Farmers',
    'Educate farmers about mobile apps and technology solutions that can increase crop yield and income',
    'agritech',
    'Use simple language. Demonstrate real apps (weather forecasting, soil testing, market prices). Interview local farmers who have benefited. Focus on practical, affordable solutions available on smartphones.',
    ARRAY['1 video demonstration', '1 farmer testimonial', 'App download link in bio'],
    'November',
    2025,
    true,
    'ADMIN-UUID-HERE'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Create promotion guidelines
-- ============================================================================

INSERT INTO promotion_guidelines (
  title,
  content,
  dos,
  donts,
  script_template,
  is_active
)
VALUES (
  'IT Services & Innovation Promotion Guidelines',
  'These guidelines will help you create authentic, impactful content that promotes technology adoption while building trust with your audience.',
  ARRAY[
    'Use regional language for better reach',
    'Share real success stories and testimonials',
    'Focus on practical benefits and affordability',
    'Highlight Indian companies and self-reliance',
    'Engage with audience questions authentically',
    'Use clear call-to-actions',
    'Create content that educates, not just sells',
    'Show real product demonstrations when possible'
  ],
  ARRAY[
    'Make false promises or exaggerated claims',
    'Promote international competitors over Indian companies',
    'Use technical jargon without explanation',
    'Delete or archive posts within 30 days',
    'Copy content from other creators',
    'Ignore negative comments or feedback',
    'Post without understanding the product/service'
  ],
  'Hi everyone! Today I want to share something that can really help [target audience] in [your region]. [Product/Service name] is a [category] solution that [key benefit]. What I love most is [personal experience]. [Specific example or demo]. If you want to [desired outcome], check the link in my bio. Let me know your thoughts in comments! 🚀',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Create guidebook resource (optional - add actual PDF URL)
-- ============================================================================

-- After uploading the Innovation Playbook PDF to Supabase Storage, update the URL below
/*
INSERT INTO guidebook_resources (
  title,
  description,
  file_url,
  file_type,
  file_size,
  category,
  is_active,
  access_level,
  uploaded_by
)
VALUES (
  'Cehpoint Innovation Movement Playbook',
  'Complete guide for promoting IT services, EdTech, AgriTech, and innovation across India. Includes sample scripts, best practices, and revenue optimization strategies.',
  'YOUR-SUPABASE-STORAGE-PDF-URL-HERE',
  'pdf',
  5242880, -- File size in bytes (example: 5MB)
  'training',
  true,
  'all',
  'ADMIN-UUID-HERE'
)
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- SUCCESS!
-- ============================================================================

-- Your setup is complete! Login credentials:
-- 
-- ADMIN LOGIN:
--   Email: admin@cehpoint.com
--   Password: Cehpoint@2025
--   Access: Full platform management, create projects/tasks, approve videos, manage revenue
--
-- INFLUENCER LOGIN:
--   Email: influencer@cehpoint.com
--   Password: Influencer@2025  
--   Access: View tasks, submit videos, track revenue, access guidebook
--
-- Next steps:
-- 1. Login as admin to create more marketing projects
-- 2. Assign tasks to the influencer using the task assignment system
-- 3. Upload the Innovation Playbook PDF to Supabase Storage and update guidebook_resources
-- 4. Test the complete influencer workflow: receive task → create video → submit → get paid

SELECT 'Setup complete! Check the comment above for login credentials.' AS status;
