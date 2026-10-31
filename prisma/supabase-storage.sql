-- Bucket penyimpanan gambar (cover artikel, foto psikolog, logo, dll).
-- Dibuat lewat SQL karena Supabase Storage menyimpan definisi bucket di
-- schema `storage`. Upload dari server memakai service role (bypass RLS),
-- sedangkan pembacaan memakai URL publik sehingga bucket harus `public`.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Baca publik untuk objek di bucket ini.
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
CREATE POLICY "Public read uploads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'uploads');

-- Tulis/hapus hanya untuk service role (dipakai server action upload).
DROP POLICY IF EXISTS "Service role write uploads" ON storage.objects;
CREATE POLICY "Service role write uploads"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'uploads')
  WITH CHECK (bucket_id = 'uploads');
