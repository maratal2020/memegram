-- ============================================
-- Memegram — Supabase SQL Schema
-- Safe to re-run (drops and recreates everything)
-- ============================================

-- Clean up existing objects (order matters: messages depends on profiles)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop policy if exists "Users can send messages" on public.messages;
drop policy if exists "Users can read own messages" on public.messages;
drop table if exists public.messages;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop table if exists public.profiles;


-- 1. Profiles table (synced from auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);


-- 2. Messages table (GIF-only messages between users)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  gif_url text not null,
  gif_title text,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can read own messages"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);


-- 3. Enable Realtime on messages
alter publication supabase_realtime add table public.messages;


-- 4. Function to auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
