-- Attendances: one row per user per screening slot
create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  movie_slug text not null,
  movie_title text not null,
  movie_poster_path text,
  cinema text not null,
  cinema_slug text not null,
  showtime timestamptz not null,
  ticket_url text,
  visibility text default 'public' check (visibility in ('public', 'friends')),
  created_at timestamptz default now(),
  unique(user_id, movie_slug, cinema_slug, showtime)
);

alter table attendances enable row level security;
create policy "read public attendances" on attendances for select using (visibility = 'public');
create policy "read own attendances" on attendances for select using (auth.uid() = user_id);
create policy "insert own attendance" on attendances for insert with check (auth.uid() = user_id);
create policy "delete own attendance" on attendances for delete using (auth.uid() = user_id);

-- Profiles: display name + optional avatar
create table if not exists profiles (
  id uuid primary key references auth.users,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "public read profiles" on profiles for select using (true);
create policy "own insert profile" on profiles for insert with check (auth.uid() = id);
create policy "own update profile" on profiles for update using (auth.uid() = id);
