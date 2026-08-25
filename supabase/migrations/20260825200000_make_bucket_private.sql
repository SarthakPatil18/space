-- Migration: Make resources storage bucket private
-- Date: 2026-08-25

UPDATE storage.buckets SET public = false WHERE id = 'resources';
