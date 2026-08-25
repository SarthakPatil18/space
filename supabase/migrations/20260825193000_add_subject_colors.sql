-- Migration: Add color column to subjects and sections tables and backfill existing data
-- Date: 2026-08-25

-- 1. Add color column to public.subjects
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS color text;

-- 2. Add color column to public.sections
ALTER TABLE public.sections
ADD COLUMN IF NOT EXISTS color text;

-- 3. Backfill colors for 7 core subjects
UPDATE public.subjects SET color = '#3B82F6' WHERE code = 'OS';
UPDATE public.subjects SET color = '#10B981' WHERE code = 'DSA';
UPDATE public.subjects SET color = '#8B5CF6' WHERE code = 'CPP';
UPDATE public.subjects SET color = '#F59E0B' WHERE code = 'AM';
UPDATE public.subjects SET color = '#EC4899' WHERE code = 'AI';
UPDATE public.subjects SET color = '#06B6D4' WHERE code = 'PROTOTYPING';
UPDATE public.subjects SET color = '#64748B' WHERE code = 'UHV';

-- 4. Backfill section colors (tints/shades of Prototyping's base color #06B6D4)
UPDATE public.sections SET color = '#22D3EE' WHERE code = 'CHEM';
UPDATE public.sections SET color = '#0891B2' WHERE code = 'SOFTWARE';
UPDATE public.sections SET color = '#0284C7' WHERE code = 'MECH';
UPDATE public.sections SET color = '#0369A1' WHERE code = 'CIVIL';
