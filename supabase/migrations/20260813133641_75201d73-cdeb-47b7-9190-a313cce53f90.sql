ALTER TABLE public.cases
  ALTER COLUMN case_type DROP NOT NULL,
  ADD COLUMN image_path text;

CREATE POLICY "Imagens de casos podem ser lidas"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'imagens-casos');

CREATE POLICY "Qualquer um pode enviar imagem de caso"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'imagens-casos');

CREATE POLICY "Admins apagam imagens de casos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'imagens-casos' AND public.has_role(auth.uid(), 'admin'));