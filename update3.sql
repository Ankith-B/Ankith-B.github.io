-- Update 3: daily visits (today, Pacific time). Run once in the Supabase SQL Editor.
create or replace function public.get_stats() returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'visits', (select value from public.stats where name = 'visits'),
    'accounts', (select count(*) from public.accounts),
    'today', (select count(*) from public.visit_log
              where created_at >= date_trunc('day', now() at time zone 'America/Los_Angeles') at time zone 'America/Los_Angeles'));
$$;
grant execute on function public.get_stats() to anon, authenticated;
