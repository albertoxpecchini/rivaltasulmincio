-- Migration: aggiunge le colonne necessarie alla tabella posts
-- per supportare il nuovo editor write-lab-v3 e l'integrazione AI.
-- Esegui nel SQL Editor di Supabase (una tantum).

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS subtitle          TEXT,
  ADD COLUMN IF NOT EXISTS tone              TEXT,
  ADD COLUMN IF NOT EXISTS reading_level     TEXT,
  ADD COLUMN IF NOT EXISTS target_audience   TEXT,
  ADD COLUMN IF NOT EXISTS event_start_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_end_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_time_text   TEXT,
  ADD COLUMN IF NOT EXISTS location_text     TEXT,
  ADD COLUMN IF NOT EXISTS address_text      TEXT,
  ADD COLUMN IF NOT EXISTS organizer         TEXT,
  ADD COLUMN IF NOT EXISTS contacts          TEXT,
  ADD COLUMN IF NOT EXISTS booking_url       TEXT,
  ADD COLUMN IF NOT EXISTS price_text        TEXT,
  ADD COLUMN IF NOT EXISTS cta_text          TEXT,
  ADD COLUMN IF NOT EXISTS cta_url           TEXT,
  ADD COLUMN IF NOT EXISTS keywords          TEXT[],
  ADD COLUMN IF NOT EXISTS tags              TEXT[],
  ADD COLUMN IF NOT EXISTS "references"      TEXT,
  ADD COLUMN IF NOT EXISTS notes             TEXT,
  ADD COLUMN IF NOT EXISTS quality           JSONB,
  ADD COLUMN IF NOT EXISTS meta              JSONB;
