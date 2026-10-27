-- Run this in Supabase SQL Editor if create tournament fails with
-- "Could not find the 'event_date' column" (schema cache out of date).

alter table public.tournament_state
  add column if not exists name text not null default 'Tournament';

alter table public.tournament_state
  add column if not exists is_current boolean not null default false;

alter table public.tournament_state
  add column if not exists event_date date;

alter table public.tournament_state
  add column if not exists prize_pool text;

update public.tournament_state
set
  name = coalesce(nullif(trim(name), ''), 'Tournament'),
  is_current = true
where id = 'default'
  and not exists (
    select 1 from public.tournament_state t where t.is_current = true
  );

create unique index if not exists tournament_state_one_current
  on public.tournament_state (is_current)
  where is_current = true;

-- Refresh PostgREST schema cache (required for API / Supabase client)
notify pgrst, 'reload schema';

-- Verify (should list event_date, prize_pool, name, is_current)
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tournament_state'
order by ordinal_position;
