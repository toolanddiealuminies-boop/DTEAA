-- Allow public (anon) guest receipt uploads
CREATE POLICY "Allow public guest receipt uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  name LIKE 'guest_%'
);

-- Allow public viewing of guest receipts (needed for admin dashboard mostly, but safe)
CREATE POLICY "Allow public view of guest receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  name LIKE 'guest_%'
);
