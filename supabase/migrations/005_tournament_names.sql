-- Multiple named tournaments; one marked live for the public tournament page.

alter table public.tournament_state
  add column if not exists name text not null default 'Tournament';

alter table public.tournament_state
  add column if not exists is_current boolean not null default false;

update public.tournament_state
set
  name = 'Tournament',
  is_current = true
where id = 'default'
  and not exists (
    select 1 from public.tournament_state t where t.is_current = true
  );

create unique index if not exists tournament_state_one_current
  on public.tournament_state (is_current)
  where is_current = true;
