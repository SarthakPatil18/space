-- Migration: Stop anonymous storage object access
-- Date: 2026-11-19
--
-- The resources bucket is private. The app serves files through signed URLs
-- created server-side with the service role key, so anonymous clients never
-- need SELECT access to storage.objects.
--
-- Leaving a world-readable SELECT policy in place lets anyone list every
-- object in the bucket (including files that are not linked from the public
-- resources table) and then request a signed URL for them.

DROP POLICY IF EXISTS "Allow storage reads" ON storage.objects;
DROP POLICY IF EXISTS "Public can read resource files" ON storage.objects;

-- Direct authenticated writes bypass the admin server functions; the app
-- performs all uploads/deletes through the service role instead.
DROP POLICY IF EXISTS "Admins can upload resource files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update resource files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete resource files" ON storage.objects;
