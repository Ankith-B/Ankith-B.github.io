-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- Replace OWNER_EMAIL_HERE with the email of the Supabase user you create for yourself.

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('message', 'disease_request')),
  disease text check (char_length(disease) <= 200),
  name text check (char_length(name) <= 120),
  email text check (char_length(email) <= 200),
  username text check (char_length(username) <= 40),
  body text not null check (char_length(body) between 1 and 4000)
);

alter table public.messages enable row level security;

-- Anyone may send a message. Nobody except the owner may read.
create policy "anyone can send" on public.messages
  for insert to anon, authenticated with check (true);

create policy "owner can read" on public.messages
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'OWNER_EMAIL_HERE');

create policy "owner can delete" on public.messages
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'OWNER_EMAIL_HERE');

grant insert on public.messages to anon, authenticated;
grant select, delete on public.messages to authenticated;

-- Header counters: page visits and accounts created. Nobody can read or write the table directly;
-- the site may only call these two functions.
create table if not exists public.stats (name text primary key, value bigint not null default 0);
insert into public.stats (name) values ('visits'), ('accounts') on conflict do nothing;
alter table public.stats enable row level security;

create or replace function public.bump_stat(stat text) returns void
language sql security definer set search_path = public as $$
  update public.stats set value = value + 1 where name = stat and stat in ('visits', 'accounts');
$$;

create or replace function public.get_stats() returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'visits', (select value from public.stats where name = 'visits'),
    'accounts', (select value from public.stats where name = 'accounts'));
$$;

grant execute on function public.bump_stat(text), public.get_stats() to anon, authenticated;
