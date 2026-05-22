-- Migration: permetti bozze senza contenuto minimo
-- Il trigger guard_post_insert_update ora controlla la lunghezza del contenuto
-- solo per i post PUBBLICATI (published = true), non per le bozze.
-- Esegui nel SQL Editor di Supabase (una tantum).

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

  if new.published and char_length(trim(coalesce(new.content, ''))) < 10 then
    raise exception 'Contenuto troppo breve';
  end if;

  select coalesce(count(*), 0) into links_count
  from regexp_matches(full_text, '(https?://|www\.)', 'gi');

  if links_count > 8 then
    raise exception 'Troppi link nel post';
  end if;

  if public.contains_blocked_words(full_text) then
    raise exception 'Il post contiene parole non consentite';
  end if;

  return new;
end;
$$;
