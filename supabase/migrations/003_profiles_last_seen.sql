alter table public.profiles
  add column if not exists last_seen_at timestamptz;

create index if not exists profiles_last_seen_at_idx
  on public.profiles (last_seen_at desc nulls last);

-- Align legacy seed gamertags with clan tag prefix
update public.soldiers
set gamertag = 'Sngঔ' || substring(gamertag from 4),
    updated_at = now()
where gamertag like 'SG\_%' escape '\';
