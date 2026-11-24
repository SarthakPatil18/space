-- Migration: Student Google Drive submissions
-- Date: 2026-11-20
--
-- Extends the existing resources table instead of creating a parallel one.
-- Existing rows are marked approved so the public library keeps working.

-- 1. New resource categories used by the student upload form
ALTER TYPE public.resource_category ADD VALUE IF NOT EXISTS 'practicals';
ALTER TYPE public.resource_category ADD VALUE IF NOT EXISTS 'assignments';
ALTER TYPE public.resource_category ADD VALUE IF NOT EXISTS 'reference';
ALTER TYPE public.resource_category ADD VALUE IF NOT EXISTS 'other';

-- 2. Submission metadata
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS academic_year integer,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS drive_web_view_link text,
  ADD COLUMN IF NOT EXISTS contributor_name text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS content_hash text;

-- Existing admin-created rows stay visible; everything new defaults to pending.
UPDATE public.resources SET status = 'approved' WHERE status IS NULL;

ALTER TABLE public.resources ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.resources ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resources_status_check'
  ) THEN
    ALTER TABLE public.resources
      ADD CONSTRAINT resources_status_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS resources_status_idx ON public.resources(status);
CREATE INDEX IF NOT EXISTS resources_academic_year_idx ON public.resources(academic_year);

CREATE UNIQUE INDEX IF NOT EXISTS resources_drive_file_id_key
  ON public.resources(drive_file_id)
  WHERE drive_file_id IS NOT NULL;

-- Duplicate submissions of the same file are blocked while pending/approved.
CREATE UNIQUE INDEX IF NOT EXISTS resources_content_hash_active_key
  ON public.resources(content_hash)
  WHERE content_hash IS NOT NULL AND status <> 'rejected';

-- 4. Public read policy only exposes approved resources.
DROP POLICY IF EXISTS "Public can read resources" ON public.resources;
DROP POLICY IF EXISTS "Public can read approved resources" ON public.resources;

CREATE POLICY "Public can read approved resources" ON public.resources
  FOR SELECT TO anon, authenticated USING (status = 'approved');
