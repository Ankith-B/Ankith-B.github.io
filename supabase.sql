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
