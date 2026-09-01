-- Migration: Increase file size limit to 50MB and add exam_type / year
-- Date: 2026-09-01

ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS exam_type text,
ADD COLUMN IF NOT EXISTS year integer;

ALTER TABLE public.resources
DROP CONSTRAINT IF EXISTS check_exam_type;

ALTER TABLE public.resources
ADD CONSTRAINT check_exam_type CHECK (exam_type IN ('mse', 'ese') OR exam_type IS NULL);

ALTER TABLE public.resources
DROP CONSTRAINT IF EXISTS resources_file_size_check;

ALTER TABLE public.resources
ADD CONSTRAINT resources_file_size_check CHECK (file_size IS NULL OR file_size <= 52428800);
