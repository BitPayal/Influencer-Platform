-- Create marketing_projects table
CREATE TABLE IF NOT EXISTS marketing_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_audience TEXT[] DEFAULT ARRAY[]::TEXT[],
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  guidelines TEXT,
  sample_script TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE marketing_projects ENABLE ROW LEVEL SECURITY;

-- Policies for marketing_projects
CREATE POLICY "Admins can manage marketing projects" ON marketing_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can view active marketing projects" ON marketing_projects
  FOR SELECT USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_marketing_projects_updated_at BEFORE UPDATE ON marketing_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
