-- Migration 002: Create projects table
-- This table stores user eBook projects with JSONB content

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled eBook',
  content JSONB NOT NULL DEFAULT '{"blocks": [], "version": 1}'::jsonb,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ NULL -- Soft delete
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON public.projects(user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_created_at
  ON public.projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_updated_at
  ON public.projects(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for projects
-- Users can only view their own non-deleted projects
CREATE POLICY "Users can view own projects"
  ON public.projects
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
  );

-- Users can insert their own projects
CREATE POLICY "Users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can soft delete their own projects
CREATE POLICY "Users can delete own projects"
  ON public.projects
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
  );

-- Add comment explaining the content structure
COMMENT ON COLUMN public.projects.content IS
'JSONB structure: {"blocks": [{"id": "uuid", "type": "text|heading|image|divider|spacer", "content": "string", "properties": {}}], "version": 1}';
