-- Versioni documenti legali — rivaltasulmincio.it
-- Esegui una sola volta nell'editor SQL di Supabase.
-- Permette di aggiornare versione e data di entrata in vigore di privacy,
-- cookie e note legali direttamente da Supabase (o dal pannello admin),
-- senza toccare il codice HTML. Il server inietta i valori a ogni richiesta.

-- ── 1. Tabella ─────────────────────────────────────────────────────────────
create table if not exists public.doc_versions (
  slug           text        primary key,          -- 'privacy' | 'cookie' | 'note-legali'
  version        text        not null,             -- es. '2.1'
  effective_date date        not null,             -- data entrata in vigore
  notes          text,                             -- changelog testuale (opzionale)
  updated_at     timestamptz not null default now()
);

comment on table public.doc_versions is
  'Versioni dei documenti legali. Aggiornabile da admin; letto lato server per iniezione HTML.';

-- ── 2. Trigger updated_at ──────────────────────────────────────────────────
create or replace function public._doc_versions_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists doc_versions_updated_at on public.doc_versions;
create trigger doc_versions_updated_at
  before update on public.doc_versions
  for each row execute procedure public._doc_versions_set_updated_at();

-- ── 3. Row-Level Security ──────────────────────────────────────────────────
alter table public.doc_versions enable row level security;

-- Lettura pubblica — necessaria per il fetch server-side con anon key
create policy "doc_versions_public_read"
  on public.doc_versions for select
  to anon, authenticated
  using (true);

-- Scrittura riservata agli admin (stessa logica degli altri endpoint protetti)
create policy "doc_versions_admin_write"
  on public.doc_versions for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 4. Dati iniziali ───────────────────────────────────────────────────────
insert into public.doc_versions (slug, version, effective_date, notes) values
  (
    'privacy',
    '2.0',
    '2026-05-24',
    'Prima versione con dati reali (CF 01662220209, APS 104236). Rimossa newsletter non ancora attiva. Rimossi sub-processor Google/Facebook assenti nel codice. Terze parti reali: Supabase, jsDelivr, Vercel.'
  ),
  (
    'cookie',
    '2.1',
    '2026-05-24',
    'Rimosso Art. 3 (confermato da DevTools: zero cookie HTTP, né di prima parte né di terze parti). localStorage documentato con chiavi reali: sb-tljwxymcavgpzntksjtx-auth-token, rsm_sec_v1_*, rsm_prefs_v1. sessionStorage non usata.'
  ),
  (
    'note-legali',
    '2.0',
    '2026-05-24',
    'Prima versione completa. Foro competente: Mantova. Rimossi Google Fonts e widget Facebook non presenti nel codice.'
  )
on conflict (slug) do nothing;
