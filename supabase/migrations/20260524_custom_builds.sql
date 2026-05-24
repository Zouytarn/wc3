-- Run this in Supabase SQL Editor to enable custom build storage

create table if not exists public.custom_builds (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  data         jsonb not null,
  created_at   timestamptz default now()
);

alter table public.custom_builds enable row level security;

-- Each user can only read/write their own builds
create policy "Users read own builds"
  on public.custom_builds for select
  using (auth.uid() = user_id);

create policy "Users insert own builds"
  on public.custom_builds for insert
  with check (auth.uid() = user_id);

create policy "Users update own builds"
  on public.custom_builds for update
  using (auth.uid() = user_id);

create policy "Users delete own builds"
  on public.custom_builds for delete
  using (auth.uid() = user_id);
