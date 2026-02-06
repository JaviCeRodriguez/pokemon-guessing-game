-- Supabase schema for Pokemon Guessing Game
-- Includes: public.app_user, public.ranking, trigger to populate app_user, and RLS policies.
--
-- Apply in Supabase SQL editor (or migrations) in this order:
-- 1) Tables
-- 2) Trigger function
-- 3) Trigger
-- 4) RLS + policies
-- 5) Indexes

-- =====
-- Tables
-- =====

create table if not exists public.app_user (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.ranking (
  user_id uuid primary key references public.app_user (id) on delete cascade,
  total_wins int not null default 0,
  best_streak int not null default 0,
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on updates
create or replace function public.set_updated_at()
returns trigger
language plpgsql
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
-- Trigger to populate public.app_user on auth
-- ==========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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

  -- Create ranking row lazily if you prefer; here we eagerly create it.
  insert into public.ranking (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ===
-- RLS
-- ===

alter table public.app_user enable row level security;
alter table public.ranking enable row level security;

-- app_user policies
drop policy if exists "app_user_select_public" on public.app_user;
create policy "app_user_select_public"
on public.app_user
for select
to public
using (true);

drop policy if exists "app_user_update_own" on public.app_user;
create policy "app_user_update_own"
on public.app_user
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ranking policies
drop policy if exists "ranking_select_public" on public.ranking;
create policy "ranking_select_public"
on public.ranking
for select
to public
using (true);

drop policy if exists "ranking_insert_own" on public.ranking;
create policy "ranking_insert_own"
on public.ranking
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "ranking_update_own" on public.ranking;
create policy "ranking_update_own"
on public.ranking
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ======
-- Indexes
-- ======

create index if not exists ranking_total_wins_desc_idx
on public.ranking (total_wins desc);

create index if not exists ranking_best_streak_desc_idx
on public.ranking (best_streak desc);

