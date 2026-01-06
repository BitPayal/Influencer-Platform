-- Seed Enhanced Data for Cehpoint Marketing Platform
-- Run this AFTER creating user accounts and running enhanced-schema-migration.sql
-- Replace 'ADMIN-UUID-HERE' and 'INFLUENCER-UUID-HERE' with actual UUIDs from Supabase Auth

-- Insert Marketing Projects
INSERT INTO marketing_projects (id, title, description, objectives, target_audience, deliverables, guidelines, sample_script, is_active, created_by) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Empowering Local Entrepreneurs through Technology',
  'Promote Cehpoint''s mission to democratize technology and help local entrepreneurs build digital businesses across India',
  ARRAY[
    'Educate viewers about digital entrepreneurship opportunities',
    'Inspire small town innovators to start tech businesses',
    'Generate leads for Cehpoint''s development services',
    'Build awareness about innovation ecosystem'
  ],
  'Entrepreneurs, students, and innovators from tier-2 and tier-3 cities',
  ARRAY[
    '1 video per month showcasing innovation ideas',
    'Clear call-to-action directing viewers to Cehpoint',
    'Local language content encouraged',
    'Examples of real success stories'
  ],
  'Focus on positive messaging. Show how technology can solve local problems. Use simple language. Include success stories from your region. Always mention Cehpoint as the technology partner enabling these innovations.',
  'Introduction: "Technology isn''t just for big cities anymore. Today I''ll show you how anyone can start a digital business from anywhere in India."\n\nMain Content: Explain one specific innovation idea (EdTech, AgriTech, HealthTech, etc.) and how it solves a local problem.\n\nCall to Action: "Visit Cehpoint to turn your idea into reality. They provide lifetime hosting, AI tools, and complete support."',
  TRUE,
  'ADMIN-UUID-HERE'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Digital India Success Stories',
  'Share inspiring stories of how digital solutions are transforming lives in rural and semi-urban India',
  ARRAY[
    'Showcase real impact of technology adoption',
    'Build credibility for digital transformation',
    'Create emotional connection with viewers',
    'Drive engagement and consultation requests'
  ],
  'General public, aspiring entrepreneurs, local business owners',
  ARRAY[
    'Interview or feature at least one local entrepreneur',
    'Show before/after transformation',
    'Include metrics and results',
    'End with actionable steps'
  ],
  'Tell authentic stories. Use real examples from your district. Show measurable impact. Keep it inspirational but realistic. Highlight how Cehpoint''s technology stack enables these transformations.',
  'Opening: "Meet [Name], who transformed [his/her] business using technology."\n\nStory: Share the journey, challenges, and how digital tools solved problems.\n\nImpact: Show results - revenue increase, customer reach, efficiency gains.\n\nConclusion: "This is possible because of platforms like Cehpoint that make technology accessible to everyone."',
  TRUE,
  'ADMIN-UUID-HERE'
);

-- Insert Monthly Tasks for current month
INSERT INTO monthly_tasks (id, project_id, title, description, topic, guidelines, deliverables_required, month, year, is_default, created_by) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'EdTech Innovation for Small Towns',
  'Create a video explaining how EdTech solutions can bring quality education to small towns and rural areas using AR/VR classrooms and AI tutoring',
  'Education Technology & Innovation',
  'Focus on AR/VR digital classrooms and AI-driven personalized tutoring. Show how students in small towns can access the same quality education as metro cities. Mention specific technologies like Firebase, Next.js that Cehpoint uses to build these solutions. Keep it simple and inspiring.',
  ARRAY[
    'Video length: 3-5 minutes',
    'Include at least one real example or use case',
    'Clear explanation of how it helps local students',
    'Call-to-action mentioning Cehpoint',
    'Upload to your primary platform (Instagram/YouTube)'
  ],
  'November',
  2025,
  TRUE,
  'ADMIN-UUID-HERE'
),
(
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'AgriTech Revolution for Farmers',
  'Showcase how AgriTech solutions like crop monitoring dashboards and digital marketplaces can empower farmers in your region',
  'Agriculture Technology & Digital Marketplaces',
  'Explain AI-based crop monitoring, yield prediction, and how farmers can sell directly to buyers through digital platforms. Emphasize that these are not complex - Cehpoint makes them simple and accessible. Show the economic impact on farmer income.',
  ARRAY[
    'Video length: 3-5 minutes',
    'Interview a local farmer if possible',
    'Explain at least two AgriTech solutions',
    'Show how it increases farmer income',
    'Include Cehpoint branding'
  ],
  'November',
  2025,
  TRUE,
  'ADMIN-UUID-HERE'
),
(
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'Local Tourism Digital Transformation',
  'Feature how tourism apps and virtual guides can promote your region globally and create employment',
  'Tourism Technology & Local Economy',
  'Talk about region-specific tourism apps, virtual local guides with multilingual support, and how technology can bring tourists to your area. Show how local tour guides, hotels, and shops benefit. Mention Cehpoint''s role in building scalable tourism platforms.',
  ARRAY[
    'Video length: 3-5 minutes',
    'Showcase your local tourist attractions',
    'Explain digital tourism solutions',
    'Show employment opportunities created',
    'Call-to-action for tourism entrepreneurs'
  ],
  'November',
  2025,
  TRUE,
  'ADMIN-UUID-HERE'
),
(
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'HealthTech for Rural India',
  'Demonstrate how telemedicine and digital health records can bring quality healthcare to remote areas',
  'Healthcare Technology & Telemedicine',
  'Focus on rural telemedicine solutions and localized digital health record systems. Explain how villagers can consult doctors remotely, how health data can be tracked digitally, and how this saves lives. Highlight Cehpoint''s secure and scalable health tech solutions.',
  ARRAY[
    'Video length: 3-5 minutes',
    'Explain telemedicine benefits clearly',
    'Show real-world health impact',
    'Include privacy and security aspects',
    'Mention Cehpoint''s health tech capabilities'
  ],
  'November',
  2025,
  TRUE,
  'ADMIN-UUID-HERE'
);

-- Insert Guidebook Resource (This will be updated after PDF upload to Supabase Storage)
INSERT INTO guidebook_resources (title, description, file_url, file_type, category, is_active, access_level, uploaded_by) VALUES
(
  'Cehpoint Innovation Movement Playbook',
  'Complete guide for influencers on promoting technology, innovation, and digital entrepreneurship across India. Includes sample post ideas, industry insights, and the vision for building a self-reliant Digital India.',
  'PLACEHOLDER-URL',
  'pdf',
  'training',
  TRUE,
  'influencer',
  'ADMIN-UUID-HERE'
);

-- Insert Promotion Guidelines
INSERT INTO promotion_guidelines (title, content, dos, donts, script_template, is_active) VALUES
(
  'Content Creation Guidelines for IT Services Promotion',
  'When creating content about Cehpoint''s IT and development services, focus on empowerment, accessibility, and real impact. Your role is to bridge the gap between technology and people who need it most.',
  ARRAY[
    'Use simple, easy-to-understand language',
    'Share real examples and success stories from your region',
    'Show enthusiasm and genuine belief in innovation',
    'Include clear call-to-action directing viewers to Cehpoint',
    'Highlight specific technologies: Firebase, Supabase, PostgreSQL, Next.js, Vercel',
    'Emphasize lifetime hosting and scalability benefits',
    'Focus on how technology reduces unemployment and creates opportunities',
    'Use local language to connect better with your audience',
    'Show diversity of industries: EdTech, AgriTech, HealthTech, Tourism, Retail, Finance'
  ],
  ARRAY[
    'Don''t use overly technical jargon that confuses viewers',
    'Don''t make unrealistic promises or guarantees',
    'Don''t criticize competitors or other platforms',
    'Don''t share inaccurate information about Cehpoint services',
    'Don''t forget to mention Cehpoint in your content',
    'Don''t create content that''s too long - keep it 3-5 minutes',
    'Don''t ignore your local context - use relevant examples',
    'Don''t upload without reviewing content quality'
  ],
  'INTRODUCTION (30 seconds):\nGreet your audience, introduce the topic, and hook them with a question or statistic about the problem.\n\nMAIN CONTENT (2-3 minutes):\n1. Explain the local problem or opportunity\n2. Introduce the technology solution\n3. Show how it works in simple terms\n4. Share real examples or success stories\n5. Explain the economic impact\n\nCALL-TO-ACTION (30 seconds):\n"If you have an innovative idea or want to start a digital business, contact Cehpoint. They provide complete technology support, lifetime hosting, and make innovation accessible to everyone."\n\nCLOSING:\nThank viewers, encourage them to share, and remind them that innovation can start anywhere.',
  TRUE
);

-- Function to auto-assign tasks to influencers (to be called monthly)
CREATE OR REPLACE FUNCTION assign_monthly_tasks_to_influencer(
  p_influencer_id UUID,
  p_month TEXT,
  p_year INTEGER,
  p_admin_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_assigned_count INTEGER := 0;
  v_task RECORD;
BEGIN
  -- Get 2 random active tasks for the month
  FOR v_task IN (
    SELECT id FROM monthly_tasks
    WHERE month = p_month
      AND year = p_year
      AND is_default = TRUE
    ORDER BY RANDOM()
    LIMIT 2
  )
  LOOP
    INSERT INTO task_assignments (
      task_id,
      influencer_id,
      assigned_month,
      assigned_year,
      status,
      assigned_by
    ) VALUES (
      v_task.id,
      p_influencer_id,
      p_month,
      p_year,
      'assigned',
      p_admin_id
    )
    ON CONFLICT (task_id, influencer_id, assigned_month, assigned_year)
    DO NOTHING;
    
    v_assigned_count := v_assigned_count + 1;
  END LOOP;
  
  RETURN v_assigned_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_monthly_tasks_to_influencer IS 'Assigns 2 random tasks to an influencer for a specific month';
