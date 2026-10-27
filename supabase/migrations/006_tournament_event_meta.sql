alter table public.tournament_state
  add column if not exists event_date date;

alter table public.tournament_state
  add column if not exists prize_pool text;
