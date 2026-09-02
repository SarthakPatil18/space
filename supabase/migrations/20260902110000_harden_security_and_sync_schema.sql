-- Migration: Production Security Hardening & Schema Alignment
-- Date: 2026-09-02
-- Objectives:
-- 1. Drop overly permissive public write/delete policies on public.resources
-- 2. Restrict public access to SELECT only
-- 3. Drop direct anonymous write/delete on storage.objects (all writes handled via authorized server functions)
-- 4. Add missing columns safely (ADD COLUMN IF NOT EXISTS)

-- 1. Public resources policies
DROP POLICY IF EXISTS "Allow resource inserts" ON public.resources;
DROP POLICY IF EXISTS "Allow resource deletes" ON public.resources;

DROP POLICY IF EXISTS "Public can read resources" ON public.resources;
CREATE POLICY "Public can read resources" ON public.resources 
  FOR SELECT TO anon, authenticated USING (true);

-- 2. Storage objects policies (hardening)
DROP POLICY IF EXISTS "Allow storage uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow storage deletes" ON storage.objects;

-- 3. Align schema drift (safe additions)
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS exam_type text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS color text;

-- Optional constraint validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_exam_type'
  ) THEN
    ALTER TABLE public.resources 
      ADD CONSTRAINT check_exam_type CHECK (exam_type IN ('mse', 'ese') OR exam_type IS NULL);
  END IF;
END $$;
