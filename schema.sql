-- ============================================
-- DTEAA - Normalized Supabase Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Main/Core)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alumni_id TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_comments TEXT,
  payment_receipt TEXT,
  profile_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. PERSONAL DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS personal_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pass_out_year TEXT NOT NULL,
  dob DATE,
  blood_group TEXT,
  email TEXT NOT NULL,
  alt_email TEXT,
  highest_qualification TEXT,
  specialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 3. CONTACT DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  present_city TEXT,
  present_state TEXT,
  present_pincode TEXT,
  present_country TEXT,
  permanent_city TEXT,
  permanent_state TEXT,
  permanent_pincode TEXT,
  permanent_country TEXT,
  same_as_present_address BOOLEAN DEFAULT false,
  mobile TEXT,
  telephone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 4. EMPLOYEE EXPERIENCE TABLE (One-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  designation TEXT,
  start_date DATE,
  end_date DATE,
  is_current_employer BOOLEAN DEFAULT false,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 5. ENTREPRENEUR EXPERIENCE TABLE (One-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS entrepreneur_experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  nature_of_business TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 6. OPEN TO WORK DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS open_to_work_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  is_open_to_work BOOLEAN DEFAULT false,
  technical_skills TEXT,
  certifications TEXT,
  soft_skills TEXT,
  other TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 7. PRIVACY SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  show_email BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT true,
  show_company BOOLEAN DEFAULT true,
  show_location BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 8. EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alumni_id TEXT REFERENCES profiles(alumni_id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT false,
  meal_preference TEXT CHECK (meal_preference IN ('Veg', 'Non-Veg')),
  total_participants INTEGER DEFAULT 1 CHECK (total_participants > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id)
);

-- ============================================
-- 9. EXECUTIVE COMMITTEE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS executive_committee (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alumni_id TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrepreneur_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_to_work_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_committee ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin (bypasses RLS)
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================
-- HELPER FUNCTION: Check if user is verified (bypasses RLS)
-- ============================================
CREATE OR REPLACE FUNCTION is_verified()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND status = 'verified'
  );
$$;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE USING (is_admin());

CREATE POLICY "Verified users can view other verified profiles"
  ON profiles FOR SELECT USING (
    status = 'verified' AND is_verified()
  );

-- ============================================
-- RLS POLICIES: PERSONAL DETAILS
-- ============================================
CREATE POLICY "Users can view their own personal details"
  ON personal_details FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal details"
  ON personal_details FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal details"
  ON personal_details FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all personal details"
  ON personal_details FOR SELECT USING (is_admin());

CREATE POLICY "Verified users can view other verified personal details"
  ON personal_details FOR SELECT USING (is_verified());

-- ============================================
-- RLS POLICIES: CONTACT DETAILS
-- ============================================
CREATE POLICY "Users can view their own contact details"
  ON contact_details FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact details"
  ON contact_details FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact details"
  ON contact_details FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact details"
  ON contact_details FOR SELECT USING (is_admin());

CREATE POLICY "Verified users can view other verified contact details"
  ON contact_details FOR SELECT USING (is_verified());

-- ============================================
-- RLS POLICIES: EMPLOYEE EXPERIENCES
-- ============================================
CREATE POLICY "Users can view their own employee experiences"
  ON employee_experiences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employee experiences"
  ON employee_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee experiences"
  ON employee_experiences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employee experiences"
  ON employee_experiences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all employee experiences"
  ON employee_experiences FOR SELECT USING (is_admin());

CREATE POLICY "Verified users can view other verified employee experiences"
  ON employee_experiences FOR SELECT USING (is_verified());

-- ============================================
-- RLS POLICIES: ENTREPRENEUR EXPERIENCES
-- ============================================
CREATE POLICY "Users can view their own entrepreneur experiences"
  ON entrepreneur_experiences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entrepreneur experiences"
  ON entrepreneur_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entrepreneur experiences"
  ON entrepreneur_experiences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entrepreneur experiences"
  ON entrepreneur_experiences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all entrepreneur experiences"
  ON entrepreneur_experiences FOR SELECT USING (is_admin());

CREATE POLICY "Verified users can view other verified entrepreneur experiences"
  ON entrepreneur_experiences FOR SELECT USING (is_verified());

-- ============================================
-- RLS POLICIES: OPEN TO WORK DETAILS
-- ============================================
CREATE POLICY "Users can view their own open to work details"
  ON open_to_work_details FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own open to work details"
  ON open_to_work_details FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own open to work details"
  ON open_to_work_details FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all open to work details"
  ON open_to_work_details FOR SELECT USING (is_admin());

CREATE POLICY "Verified users can view other verified open to work details"
  ON open_to_work_details FOR SELECT USING (is_verified());

-- ============================================
-- RLS POLICIES: PRIVACY SETTINGS
-- ============================================
CREATE POLICY "Users can view their own privacy settings"
  ON privacy_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings"
  ON privacy_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
  ON privacy_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all privacy settings"
  ON privacy_settings FOR SELECT USING (is_admin());

-- ============================================
-- RLS POLICIES: EVENT REGISTRATIONS
-- ============================================
CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations"
  ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON event_registrations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON event_registrations FOR SELECT USING (is_admin());

-- ============================================
-- RLS POLICIES: EXECUTIVE COMMITTEE
-- ============================================
CREATE POLICY "Anyone can view active executive committee"
  ON executive_committee FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage executive committee"
  ON executive_committee FOR ALL USING (is_admin());

-- ============================================
-- DATABASE FUNCTION: get_next_alumni_id
-- ============================================
CREATE OR REPLACE FUNCTION get_next_alumni_id(pass_out_year TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_seq INTEGER;
  result TEXT;
BEGIN
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(alumni_id FROM 'DTEAA-' || pass_out_year || '-(\d+)') AS INTEGER
      )
    ),
    0
  ) + 1
  INTO next_seq
  FROM profiles
  WHERE alumni_id LIKE 'DTEAA-' || pass_out_year || '-%';
  
  result := 'DTEAA-' || pass_out_year || '-' || LPAD(next_seq::TEXT, 4, '0');
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_next_alumni_id(TEXT) TO authenticated;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_alumni_id ON profiles(alumni_id);
CREATE INDEX IF NOT EXISTS idx_personal_details_alumni_id ON personal_details(alumni_id);
CREATE INDEX IF NOT EXISTS idx_personal_details_user_id ON personal_details(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_details_alumni_id ON contact_details(alumni_id);
CREATE INDEX IF NOT EXISTS idx_employee_exp_alumni_id ON employee_experiences(alumni_id);
CREATE INDEX IF NOT EXISTS idx_employee_exp_user_id ON employee_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_entrepreneur_exp_alumni_id ON entrepreneur_experiences(alumni_id);
CREATE INDEX IF NOT EXISTS idx_entrepreneur_exp_user_id ON entrepreneur_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_alumni_id ON event_registrations(alumni_id);
