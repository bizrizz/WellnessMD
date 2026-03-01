-- Add avatar_url to profiles (run in Supabase Dashboard → SQL Editor)
-- Safe to run: uses "if not exists"

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
