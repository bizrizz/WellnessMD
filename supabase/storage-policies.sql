-- ============================================================
-- Storage RLS: Fix "new row violates row-level security policy"
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Prerequisite: Create bucket "avatars" first (Storage → New bucket → name "avatars" → Public).
-- This allows authenticated users to upload avatars to their own folder.

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
