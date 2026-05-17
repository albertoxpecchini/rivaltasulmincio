-- Rivalta sul Mincio — Newsletter subscribers
-- Run this in the Supabase SQL editor to add newsletter support.

-- ── 1. Table ──────────────────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id            uuid        primary key default gen_random_uuid(),
  email         text        not null unique,
  subscribed_at timestamptz not null default now(),
  is_active     boolean     not null default true,
  source        text        not null default 'web',
  name          text,
  unsubscribed_at timestamptz
);

-- Index for fast lookup by email
create unique index if not exists idx_newsletter_email_unique
  on public.newsletter_subscribers (lower(email));

-- Index for active subscribers (used when sending campaigns)
create index if not exists idx_newsletter_active
  on public.newsletter_subscribers (is_active)
  where is_active = true;

-- ── 2. Row-Level Security ─────────────────────────────────────────────────
alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (INSERT only, no personal data returned)
create policy "newsletter_public_insert"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated admins can view/manage subscribers
create policy "newsletter_admin_select"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid()
         and role = 'admin'
    )
  );

create policy "newsletter_admin_update"
  on public.newsletter_subscribers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid()
         and role = 'admin'
    )
  );

create policy "newsletter_admin_delete"
  on public.newsletter_subscribers
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid()
         and role = 'admin'
    )
  );

-- ── 3. Unsubscribe helper function ────────────────────────────────────────
create or replace function public.newsletter_unsubscribe(p_email text)
returns void
language sql
security definer
as $$
  update public.newsletter_subscribers
     set is_active = false,
         unsubscribed_at = now()
   where lower(email) = lower(p_email);
$$;

-- Allow anonymous calls (e.g., from an unsubscribe link)
grant execute on function public.newsletter_unsubscribe(text) to anon, authenticated;
