ALTER TABLE public.resources ALTER COLUMN file_url DROP NOT NULL;

CREATE POLICY "Public can read resource files" ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');
CREATE POLICY "Admins can upload resource files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update resource files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resources' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete resource files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND public.has_role(auth.uid(),'admin'));