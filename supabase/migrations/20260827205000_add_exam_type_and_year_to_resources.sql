-- Migration: Add exam_type and year to resources table
-- Date: 2026-08-27

ALTER TABLE public.resources
ADD COLUMN exam_type text,
ADD COLUMN year integer;

-- Limit exam_type to 'mse', 'ese', or null
ALTER TABLE public.resources
ADD CONSTRAINT check_exam_type CHECK (exam_type IN ('mse', 'ese') OR exam_type IS NULL);
