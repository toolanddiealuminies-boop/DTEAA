-- 1. Ensure RLS is enabled
ALTER TABLE guest_sponsorships ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insertion policy to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert guest sponsorships" ON guest_sponsorships;

-- 3. Re-create the policy allowing public inserts
CREATE POLICY "Anyone can insert guest sponsorships"
ON guest_sponsorships FOR INSERT
WITH CHECK (true);

-- 4. CRITICAL: Grant permission to the 'anon' role (public users)
GRANT INSERT ON guest_sponsorships TO anon;
GRANT SELECT ON guest_sponsorships TO anon; -- Optional: if you want them to see their own data potentially later

-- 5. Ensure service role has full access
GRANT ALL ON guest_sponsorships TO service_role;
