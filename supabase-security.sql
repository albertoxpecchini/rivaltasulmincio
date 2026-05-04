-- Supabase security baseline for Rivalta sul Mincio
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- Utility functions
-- ------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

create or replace function public.is_member(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role in ('user', 'admin')
  );
$$;

-- ------------------------------------------------------------------
-- Settings table
-- ------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  comment_privacy text not null default 'all' check (comment_privacy in ('all', 'members', 'none')),
  notif_frequency text not null default 'daily' check (notif_frequency in ('instant', 'daily', 'weekly', 'off')),
  notif_email boolean not null default false,
  preferred_categories jsonb not null default '[]'::jsonb,
  accessibility_fontsize text not null default 'md' check (accessibility_fontsize in ('sm', 'md', 'lg', 'xl')),
  accessibility_high_contrast boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_user_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.touch_user_settings_updated_at();

-- ------------------------------------------------------------------
-- Toxic words dictionary
-- ------------------------------------------------------------------
create table if not exists public.blocked_words (
  word text primary key,
  created_at timestamptz not null default now()
);

insert into public.blocked_words(word)
values
  ('vaffanculo'),
  ('stronzo'),
  ('coglione'),
  ('merda'),
  ('idiota'),
  ('cretino'),
  ('troia'),
  ('puttana'),
  ('razzista'),
  ('violenza')
on conflict do nothing;

create or replace function public.contains_blocked_words(input_text text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blocked_words b
    where lower(coalesce(input_text, '')) ~ ('(^|\\W)' || regexp_replace(lower(b.word), '([\\W])', '\\\\1', 'g') || '(\\W|$)')
  );
$$;

-- ------------------------------------------------------------------
-- Comments
-- ------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_username text,
  content text not null,
  is_hidden boolean not null default false,
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_user_id on public.comments(user_id);

create or replace function public.touch_comments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
before update on public.comments
for each row execute function public.touch_comments_updated_at();

create or replace function public.guard_comment_insert_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  links_count int;
begin
  if char_length(trim(coalesce(new.content, ''))) < 3 then
    raise exception 'Commento troppo breve';
  end if;

  if char_length(coalesce(new.content, '')) > 1200 then
    raise exception 'Commento troppo lungo';
  end if;

  select coalesce(count(*), 0) into links_count
  from regexp_matches(coalesce(new.content, ''), '(https?://|www\\.)', 'gi');

  if links_count > 2 then
    raise exception 'Troppi link nel commento';
  end if;

  if public.contains_blocked_words(new.content) then
    raise exception 'Il commento contiene parole non consentite';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_comments on public.comments;
create trigger trg_guard_comments
before insert or update on public.comments
for each row execute function public.guard_comment_insert_update();

-- ------------------------------------------------------------------
-- Reports / moderation queue
-- ------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_check check (post_id is not null or comment_id is not null)
);

create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_created_at on public.reports(created_at desc);
create unique index if not exists uq_reports_unique_per_user_target
on public.reports(reporter_id, coalesce(post_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(comment_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ------------------------------------------------------------------
-- Post likes (single like per user/post)
-- ------------------------------------------------------------------
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_username text,
  created_at timestamptz not null default now(),
  constraint post_likes_unique_per_user_post unique (post_id, user_id)
);

create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_likes_user_id on public.post_likes(user_id);
create index if not exists idx_post_likes_created_at on public.post_likes(created_at desc);

-- ------------------------------------------------------------------
-- Lightweight notifications for post authors
-- ------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_username text,
  post_id uuid not null references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  type text not null check (type in ('like', 'comment')),
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read, created_at desc);

-- ------------------------------------------------------------------
-- Post guard (anti-spam + toxic words)
-- ------------------------------------------------------------------
create or replace function public.guard_post_insert_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  links_count int;
  full_text text;
begin
  full_text := concat_ws(E'\n', coalesce(new.title, ''), coalesce(new.excerpt, ''), coalesce(new.content, ''));

  if char_length(trim(coalesce(new.title, ''))) < 3 then
    raise exception 'Titolo troppo breve';
  end if;

  if char_length(trim(coalesce(new.content, ''))) < 10 then
    raise exception 'Contenuto troppo breve';
  end if;

  select coalesce(count(*), 0) into links_count
  from regexp_matches(full_text, '(https?://|www\\.)', 'gi');

  if links_count > 8 then
    raise exception 'Troppi link nel post';
  end if;

  if public.contains_blocked_words(full_text) then
    raise exception 'Il post contiene parole non consentite';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_posts on public.posts;
create trigger trg_guard_posts
before insert or update on public.posts
for each row execute function public.guard_post_insert_update();

-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.user_settings enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.post_likes enable row level security;
alter table public.notifications enable row level security;

-- Profiles
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
for select using (true);

drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles
for update using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

-- Posts
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts
for select using (
  published = true
  or auth.uid() = user_id
  or public.is_admin(auth.uid())
);

drop policy if exists posts_owner_insert on public.posts;
create policy posts_owner_insert on public.posts
for insert with check (
  auth.uid() = user_id
  and public.is_member(auth.uid())
);

drop policy if exists posts_owner_update on public.posts;
create policy posts_owner_update on public.posts
for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists posts_owner_delete on public.posts;
create policy posts_owner_delete on public.posts
for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- User settings
drop policy if exists user_settings_owner_read on public.user_settings;
create policy user_settings_owner_read on public.user_settings
for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists user_settings_owner_insert on public.user_settings;
create policy user_settings_owner_insert on public.user_settings
for insert with check (auth.uid() = user_id);

drop policy if exists user_settings_owner_update on public.user_settings;
create policy user_settings_owner_update on public.user_settings
for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists user_settings_owner_delete on public.user_settings;
create policy user_settings_owner_delete on public.user_settings
for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Comments
drop policy if exists comments_public_read on public.comments;
create policy comments_public_read on public.comments
for select using (
  is_hidden = false
  or auth.uid() = user_id
  or public.is_admin(auth.uid())
);

drop policy if exists comments_member_insert on public.comments;
create policy comments_member_insert on public.comments
for insert with check (
  auth.uid() = user_id
  and public.is_member(auth.uid())
);

drop policy if exists comments_owner_update_short_window on public.comments;
create policy comments_owner_update_short_window on public.comments
for update using (
  auth.uid() = user_id
  and created_at > now() - interval '10 minutes'
)
with check (
  auth.uid() = user_id
  and created_at > now() - interval '10 minutes'
);

drop policy if exists comments_owner_or_admin_delete on public.comments;
create policy comments_owner_or_admin_delete on public.comments
for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Reports
drop policy if exists reports_admin_read on public.reports;
create policy reports_admin_read on public.reports
for select using (public.is_admin(auth.uid()));

drop policy if exists reports_user_insert on public.reports;
create policy reports_user_insert on public.reports
for insert with check (auth.uid() = reporter_id);

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports
for update using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists reports_admin_delete on public.reports;
create policy reports_admin_delete on public.reports
for delete using (public.is_admin(auth.uid()));

-- Post likes
drop policy if exists post_likes_public_read on public.post_likes;
create policy post_likes_public_read on public.post_likes
for select using (true);

drop policy if exists post_likes_member_insert on public.post_likes;
create policy post_likes_member_insert on public.post_likes
for insert with check (
  auth.uid() = user_id
  and public.is_member(auth.uid())
);

drop policy if exists post_likes_owner_or_admin_delete on public.post_likes;
create policy post_likes_owner_or_admin_delete on public.post_likes
for delete using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);

-- Notifications
drop policy if exists notifications_owner_or_admin_read on public.notifications;
create policy notifications_owner_or_admin_read on public.notifications
for select using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);

drop policy if exists notifications_actor_insert on public.notifications;
create policy notifications_actor_insert on public.notifications
for insert with check (
  auth.uid() = actor_id
  and auth.uid() <> user_id
  and public.is_member(auth.uid())
);

drop policy if exists notifications_owner_or_admin_update on public.notifications;
create policy notifications_owner_or_admin_update on public.notifications
for update using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
)
with check (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);

drop policy if exists notifications_owner_or_admin_delete on public.notifications;
create policy notifications_owner_or_admin_delete on public.notifications
for delete using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
);
