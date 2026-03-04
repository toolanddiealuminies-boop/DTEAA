-- ============================================
-- MIGRATION: Create events table for admin CRUD
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active events
CREATE POLICY "Authenticated users can view active events"
  ON events FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin());

-- Grant permissions
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

-- Index
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

-- ============================================
-- Update RLS: Allow all authenticated users to view
-- profiles in directory (regardless of status)
-- ============================================
-- Add policy for authenticated users to view all profiles in directory
CREATE POLICY "Authenticated users can view all profiles for directory"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all personal details for directory
CREATE POLICY "Authenticated users can view all personal details for directory"
  ON personal_details FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all contact details for directory
CREATE POLICY "Authenticated users can view all contact details for directory"
  ON contact_details FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all employee experiences for directory
CREATE POLICY "Authenticated users can view all employee experiences for directory"
  ON employee_experiences FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all entrepreneur experiences for directory
CREATE POLICY "Authenticated users can view all entrepreneur experiences for directory"
  ON entrepreneur_experiences FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all open to work details for directory
CREATE POLICY "Authenticated users can view all open_to_work details for directory"
  ON open_to_work_details FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to view all privacy settings for directory
CREATE POLICY "Authenticated users can view all privacy settings for directory"
  ON privacy_settings FOR SELECT
  TO authenticated
  USING (true);
