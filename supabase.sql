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

-- Accounts that work on every device. The table is locked; only these functions can touch it.
create table if not exists public.accounts (
  username text primary key check (username ~ '^[A-Za-z0-9_.-]{3,20}$'),
  email text unique,
  salt text not null,
  pw_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security;
create unique index if not exists accounts_username_ci on public.accounts (lower(username));


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
    'accounts', (select count(*) from public.accounts));
$$;

grant execute on function public.bump_stat(text), public.get_stats() to anon, authenticated;

create or replace function public.acct_signup(uname text, mail text, salt text, pw_hash text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from accounts where lower(username) = lower(uname)) then return 'taken'; end if;
  if coalesce(mail, '') <> '' and exists (select 1 from accounts where email = lower(mail)) then return 'email'; end if;
  insert into accounts (username, email, salt, pw_hash) values (uname, nullif(lower(mail), ''), salt, pw_hash);
  return 'ok';
end $$;

-- Returns the salt for a username or email (a stable fake salt if unknown, so lookups reveal nothing).
create or replace function public.acct_salt(ident text) returns text
language sql security definer set search_path = public as $$
  select coalesce(
    (select salt from accounts where lower(username) = lower(ident) or email = lower(ident) limit 1),
    encode(sha256(convert_to('x' || lower(ident), 'UTF8')), 'base64'));
$$;

create or replace function public.acct_login(ident text, pw_hash text) returns text
language sql security definer set search_path = public as $$
  select username from accounts
  where (lower(username) = lower(ident) or email = lower(ident)) and accounts.pw_hash = acct_login.pw_hash limit 1;
$$;

grant execute on function public.acct_signup(text, text, text, text), public.acct_salt(text), public.acct_login(text, text) to anon, authenticated;

-- Owner dashboard: all accounts and site numbers. Only the Supabase user whose email is OWNER_EMAIL_HERE may call it.
create or replace function public.admin_overview() returns json
language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() ->> 'email') is distinct from 'OWNER_EMAIL_HERE' then raise exception 'not allowed'; end if;
  return json_build_object(
    'visits', (select value from stats where name = 'visits'),
    'accounts', (select count(*) from accounts),
    'users', coalesce((select json_agg(json_build_object('username', username, 'email', email, 'created_at', created_at) order by created_at desc) from accounts), '[]'::json));
end $$;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
