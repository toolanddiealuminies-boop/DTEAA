-- Secure RPC for Guest Sponsorship Submission
-- This bypasses RLS by using SECURITY DEFINER, allowing us to safely insert and return the ID
-- without exposing the table to public SELECT permissions.

CREATE OR REPLACE FUNCTION submit_guest_sponsorship(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_organization TEXT,
  p_amount INTEGER,
  p_payment_receipt TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Run as owner (bypasses RLS)
SET search_path = public
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO guest_sponsorships (
    full_name,
    email,
    phone,
    organization,
    amount,
    payment_receipt,
    status
  )
  VALUES (
    p_full_name,
    p_email,
    p_phone,
    p_organization,
    p_amount,
    p_payment_receipt,
    'pending'
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- Grant execution to everyone (including guests)
GRANT EXECUTE ON FUNCTION submit_guest_sponsorship(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION submit_guest_sponsorship(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_guest_sponsorship(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO service_role;
