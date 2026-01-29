-- Create portfolio bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled (it usually is by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public Read Access for portfolio bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio' );

-- Policy 2: Authenticated Users can Insert (Upload) to portfolio bucket
CREATE POLICY "Auth Users Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'portfolio' );

-- Policy 3: Authenticated Users can Update their own files (or all files in this bucket)
CREATE POLICY "Auth Users Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'portfolio' )
WITH CHECK ( bucket_id = 'portfolio' );

-- Policy 4: Authenticated Users can Delete their own files in portfolio bucket
CREATE POLICY "Auth Users Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'portfolio' );
