-- Pokemon Guessing Game — Supabase schema
-- Idempotent bootstrap for a new project.

begin;

-- ======
-- Tables
-- ======

create table if not exists public.app_user (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint app_user_username_length_check
    check (username is null or char_length(username) between 3 and 32),
  constraint app_user_full_name_length_check
    check (full_name is null or char_length(full_name) between 1 and 120),
  constraint app_user_avatar_url_length_check
    check (avatar_url is null or char_length(avatar_url) <= 2048)
);

create table if not exists public.ranking (
  user_id uuid primary key references public.app_user (id) on delete cascade,
  total_wins integer not null default 0,
  best_streak integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint ranking_total_wins_nonnegative_check check (total_wins >= 0),
  constraint ranking_best_streak_nonnegative_check check (best_streak >= 0)
);

-- =================
-- Timestamp trigger
-- =================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ranking_updated_at on public.ranking;
create trigger set_ranking_updated_at
before update on public.ranking
for each row
execute function public.set_updated_at();

-- ==========================================
-- Create the public profile after Auth signup
-- ==========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.app_user (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  insert into public.ranking (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Backfill safely if Auth users existed before this schema was applied.
insert into public.app_user (id, full_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  coalesce(raw_user_meta_data ->> 'avatar_url', raw_user_meta_data ->> 'picture')
from auth.users
on conflict (id) do nothing;

insert into public.ranking (user_id)
select id from public.app_user
on conflict (user_id) do nothing;

-- ==================
-- Row-level security
-- ==================

alter table public.app_user enable row level security;
alter table public.ranking enable row level security;

drop policy if exists "app_user_select_public" on public.app_user;
create policy "app_user_select_public"
on public.app_user
for select
to anon, authenticated
using (true);

drop policy if exists "app_user_update_own" on public.app_user;
create policy "app_user_update_own"
on public.app_user
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "ranking_select_public" on public.ranking;
create policy "ranking_select_public"
on public.ranking
for select
to anon, authenticated
using (true);

drop policy if exists "ranking_insert_own" on public.ranking;
create policy "ranking_insert_own"
on public.ranking
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "ranking_update_own" on public.ranking;
create policy "ranking_update_own"
on public.ranking
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ===================
-- Data API privileges
-- ===================

grant usage on schema public to anon, authenticated;
grant select on table public.app_user, public.ranking to anon, authenticated;
grant update (username, full_name, avatar_url) on table public.app_user to authenticated;
grant insert (user_id, total_wins, best_streak), update (total_wins, best_streak)
  on table public.ranking to authenticated;

-- =======
-- Indexes
-- =======

create index if not exists ranking_leaderboard_idx
on public.ranking (total_wins desc, best_streak desc);

commit;
