-- Migration 005: Create ebook-images bucket for project images
-- This ensures images uploaded via the editor are stored and accessible

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ebook-images',
    'ebook-images',
    true, -- Public for viewing in the editor and PDF
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies

-- Anyone can view images (since public is true, this is the default, but explicit is better)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ebook-images' );

-- Authenticated users can upload to their own folders: {userId}/{projectId}/{fileName}
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'ebook-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'ebook-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own images (e.g. overwriting)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'ebook-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
