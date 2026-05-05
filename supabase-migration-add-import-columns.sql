-- Migration: add import columns to posts table
-- Run this in the Supabase SQL editor BEFORE running the import script.
--
-- Adds:
--   image_url   TEXT  -- public URL of the post cover image (Supabase Storage or external HTTPS)
--   source_url  TEXT  -- canonical URL on the source site (used for deduplication on re-import)
--   event_date  TIMESTAMPTZ -- date of the event (may differ from published_at)
--
-- Also creates a partial unique index on source_url to prevent duplicate imports.
--
-- NOTE: Supabase Storage bucket creation cannot be done in SQL.
-- Create the 'post-images' bucket manually:
--   1. Go to Supabase dashboard → Storage → New bucket
--   2. Name: post-images
--   3. Public: YES
-- Or let the import script create it automatically via the Storage REST API.

alter table public.posts
  add column if not exists image_url   text,
  add column if not exists source_url  text,
  add column if not exists event_date  timestamptz;

-- Partial unique index: only enforce uniqueness when source_url is non-null.
create unique index if not exists idx_posts_source_url
  on public.posts (source_url)
  where source_url is not null;
