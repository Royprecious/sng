-- Full schema for SniperGang (001 + 002). Safe to re-run for tables; policies may need manual drop if re-applying.

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
  combat_role text check (
    combat_role is null
    or combat_role in ('fragger', 'support', 'sniper', 'igl')
  ),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_state (
  id text primary key default 'default',
  name text not null default 'Tournament',
  is_current boolean not null default false,
  event_date date,
  prize_pool text,
  kill_point int not null default 1,
  placement_points jsonb not null default '[]'::jsonb,
  matches jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists tournament_state_one_current
  on public.tournament_state (is_current)
  where is_current = true;

insert into public.tournament_state (id, name, is_current, kill_point, placement_points, matches)
values ('default', 'Tournament', true, 1, '[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;

alter table public.soldiers enable row level security;
alter table public.tournament_state enable row level security;

drop policy if exists "Public read soldiers" on public.soldiers;
create policy "Public read soldiers"
  on public.soldiers for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read tournament" on public.tournament_state;
create policy "Public read tournament"
  on public.tournament_state for select
  to anon, authenticated
  using (true);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'viewer'
    check (role in ('super_admin', 'admin', 'viewer')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text,
  created_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz,
  max_uses int not null default 1 check (max_uses > 0),
  use_count int not null default 0 check (use_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.admin_invite_codes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.admin_invite_codes enable row level security;
alter table public.admin_code_redemptions enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

create index if not exists profiles_last_seen_at_idx
  on public.profiles (last_seen_at desc nulls last);

update public.soldiers
set gamertag = 'Sngঔ' || substring(gamertag from 4),
    updated_at = now()
where gamertag like 'SG\_%' escape '\';

alter table public.soldiers
  add column if not exists combat_role text
  check (
    combat_role is null
    or combat_role in ('fragger', 'support', 'sniper', 'igl')
  );
