-- Auth roles & admin invite codes (run after enabling Google provider in Supabase Auth)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'viewer'
    check (role in ('super_admin', 'admin', 'viewer')),
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

-- Users can read their own profile (when using Supabase client directly)
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);
