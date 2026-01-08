-- Fix missing UPDATE policy for influencers table

-- Allow influencers to update their own profile
CREATE POLICY "Influencers can update own profile" ON influencers
  FOR UPDATE USING (user_id = auth.uid());

-- Just in case, grant update permission explicitly if needed (usually handled by RLS enablement)
-- GRANT UPDATE ON influencers TO authenticated;
