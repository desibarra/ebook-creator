-- Migration 003: Enable RLS and create storage policies
-- This ensures all tables have Row Level Security enabled

-- Double-check RLS is enabled (should already be done in previous migrations)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create helper function for storage path validation
CREATE OR REPLACE FUNCTION public.is_storage_owner(bucket_name TEXT, object_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Extract user ID from path (format: user_id/filename)
  RETURN (storage.foldername(object_path))[1] = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage on public schema functions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_storage_owner TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
