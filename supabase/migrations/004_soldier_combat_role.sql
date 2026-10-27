alter table public.soldiers
  add column if not exists combat_role text
  check (
    combat_role is null
    or combat_role in ('fragger', 'support', 'sniper', 'igl')
  );

update public.soldiers
set combat_role = case
  when lower(specialty) like '%sniper%' then 'sniper'
  when lower(specialty) like '%igl%' then 'igl'
  when lower(specialty) like '%support%' then 'support'
  else 'fragger'
end
where combat_role is null;
