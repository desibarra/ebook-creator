-- Migration 004: Create storage buckets for file uploads
-- This creates buckets for project thumbnails and user uploads

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'project-thumbnails',
    'project-thumbnails',
    true, -- Public bucket for thumbnails
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'user-uploads',
    'user-uploads',
    false, -- Private bucket for user files
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for project-thumbnails bucket
-- Users can upload thumbnails to their own folder
CREATE POLICY "Users can upload own thumbnails"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own thumbnails
CREATE POLICY "Users can update own thumbnails"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own thumbnails
CREATE POLICY "Users can delete own thumbnails"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view public thumbnails (bucket is public)
CREATE POLICY "Public can view thumbnails"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-thumbnails');

-- Storage RLS Policies for user-uploads bucket
-- Users can upload files to their own folder
CREATE POLICY "Users can upload own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
