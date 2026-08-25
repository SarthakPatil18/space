-- Migration: Setup MITAOE Space Read-Only Backend V1 (Clean Reset)
-- Date: 2026-08-25

-- 1. Drop existing tables if present to ensure clean schema rebuild
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;

-- 2. Create Enum for Resource Category
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_category') THEN
    CREATE TYPE public.resource_category AS ENUM ('notes', 'files', 'pyqs', 'syllabus');
  END IF;
END $$;

-- 3. Helper function for timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Create Table: subjects
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create Table: sections
CREATE TABLE public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sections_id_subject_id_key UNIQUE (id, subject_id)
);

-- 6. Create Table: resources
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  section_id uuid,
  title text NOT NULL,
  category public.resource_category NOT NULL,
  file_path text,
  file_type text,
  file_size bigint CHECK (file_size IS NULL OR file_size <= 20971520),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resources_section_subject_fkey FOREIGN KEY (section_id, subject_id) 
    REFERENCES public.sections(id, subject_id) ON DELETE RESTRICT
);

-- 7. Triggers
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER sections_updated_at BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Indexes
CREATE INDEX subjects_code_idx ON public.subjects(code);
CREATE INDEX sections_subject_id_idx ON public.sections(subject_id);
CREATE INDEX resources_subject_id_idx ON public.resources(subject_id);
CREATE INDEX resources_section_id_idx ON public.resources(section_id);
CREATE INDEX resources_category_idx ON public.resources(category);
CREATE INDEX resources_created_at_idx ON public.resources(created_at);

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE INDEX resources_title_trgm_idx ON public.resources USING gin (title extensions.gin_trgm_ops);
CREATE INDEX resources_description_trgm_idx ON public.resources USING gin (description extensions.gin_trgm_ops);

-- 9. Row Level Security & Policies
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.subjects TO anon, authenticated;
GRANT SELECT ON public.sections TO anon, authenticated;
GRANT SELECT ON public.resources TO anon, authenticated;

GRANT ALL ON public.subjects TO service_role;
GRANT ALL ON public.sections TO service_role;
GRANT ALL ON public.resources TO service_role;

CREATE POLICY "Public can read subjects" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read sections" ON public.sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read resources" ON public.resources FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow resource inserts" ON public.resources FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow resource deletes" ON public.resources FOR DELETE TO anon, authenticated USING (true);

-- 10. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resources', 'resources', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS "Allow storage uploads" ON storage.objects;
CREATE POLICY "Allow storage uploads" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'resources');

DROP POLICY IF EXISTS "Allow storage deletes" ON storage.objects;
CREATE POLICY "Allow storage deletes" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'resources');

-- 11. Seed Data (7 Subjects & 4 Sections)
INSERT INTO public.subjects (name, code) VALUES
  ('Operating Systems', 'OS'),
  ('Data Structures & Algorithms', 'DSA'),
  ('C++', 'CPP'),
  ('Applied Mathematics', 'AM'),
  ('Artificial Intelligence', 'AI'),
  ('Prototyping', 'PROTOTYPING'),
  ('Universal Human Values', 'UHV');

INSERT INTO public.sections (subject_id, name, code)
SELECT s.id, sec.name, sec.code
FROM public.subjects s
CROSS JOIN (VALUES
  ('Chemistry', 'CHEM'),
  ('Software', 'SOFTWARE'),
  ('Mechanical', 'MECH'),
  ('Civil', 'CIVIL')
) AS sec(name, code)
WHERE s.code = 'PROTOTYPING';
