-- Update 2: per-account visit tracking. Run once in the Supabase SQL Editor. No email to edit.
create table if not exists public.visit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  username text check (char_length(username) <= 40)
);
alter table public.visit_log enable row level security;

create or replace function public.record_visit(uname text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update stats set value = value + 1 where name = 'visits';
  insert into visit_log (username) values (nullif(left(uname, 40), ''));
end $$;
grant execute on function public.record_visit(text) to anon, authenticated;

-- Owner = the first (and only) Supabase auth user.
create or replace function public.admin_overview() returns json
language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  select id into owner_id from auth.users order by created_at limit 1;
  if auth.uid() is null or auth.uid() is distinct from owner_id then raise exception 'not allowed'; end if;
  return json_build_object(
    'visits', (select value from stats where name = 'visits'),
    'accounts', (select count(*) from accounts),
    'guest_visits', (select count(*) from visit_log where username is null),
    'untracked', greatest((select value from stats where name = 'visits') - (select count(*) from visit_log), 0),
    'users', coalesce((select json_agg(json_build_object('username', a.username, 'email', a.email, 'created_at', a.created_at,
       'visits', (select count(*) from visit_log v where lower(v.username) = lower(a.username))) order by a.created_at desc) from accounts a), '[]'::json));
end $$;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
