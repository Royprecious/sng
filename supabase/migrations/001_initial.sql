-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

create table if not exists public.soldiers (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  gamertag text not null unique,
  role text not null,
  clan_rank text not null,
  tier text not null,
  specialty text not null default '',
  kd text not null default '0',
  region text not null default '',
  avatar text not null default '??',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_state (
  id text primary key default 'default',
  kill_point int not null default 1,
  placement_points jsonb not null default '[]'::jsonb,
  matches jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.tournament_state (id, kill_point, placement_points, matches)
values ('default', 1, '[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;

alter table public.soldiers enable row level security;
alter table public.tournament_state enable row level security;

-- Backend uses service_role key (bypasses RLS). Optional read-only anon access:
create policy "Public read soldiers"
  on public.soldiers for select
  to anon, authenticated
  using (true);

create policy "Public read tournament"
  on public.tournament_state for select
  to anon, authenticated
  using (true);
