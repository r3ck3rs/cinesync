-- CineSync Database Schema
-- Run this in the Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for username search

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null unique,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[a-z0-9_]+$')
);

create index profiles_username_trgm_idx on public.profiles using gin (username gin_trgm_ops);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- PLANS
-- ─────────────────────────────────────────────
create type public.plan_status as enum ('planning', 'confirmed', 'done', 'cancelled');

create table public.plans (
  id                 uuid primary key default uuid_generate_v4(),
  created_by         uuid not null references public.profiles(id) on delete cascade,
  title              text not null,
  tmdb_movie_id      integer,
  movie_title        text,
  movie_poster_path  text,
  scheduled_at       timestamptz,
  location           text,
  notes              text,
  is_public          boolean not null default false,
  status             public.plan_status not null default 'planning',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint title_length check (char_length(title) between 1 and 200)
);

create index plans_created_by_idx on public.plans (created_by);
create index plans_scheduled_at_idx on public.plans (scheduled_at);
create index plans_tmdb_movie_id_idx on public.plans (tmdb_movie_id);

create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- PLAN MEMBERS
-- ─────────────────────────────────────────────
create type public.member_role as enum ('owner', 'member');
create type public.rsvp_status as enum ('pending', 'accepted', 'declined');

create table public.plan_members (
  id         uuid primary key default uuid_generate_v4(),
  plan_id    uuid not null references public.plans(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       public.member_role not null default 'member',
  rsvp       public.rsvp_status not null default 'pending',
  joined_at  timestamptz not null default now(),
  unique (plan_id, user_id)
);

create index plan_members_user_id_idx on public.plan_members (user_id);
create index plan_members_plan_id_idx on public.plan_members (plan_id);

-- Auto-add creator as owner
create or replace function public.add_plan_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.plan_members (plan_id, user_id, role, rsvp)
  values (new.id, new.created_by, 'owner', 'accepted');
  return new;
end;
$$;

create trigger on_plan_created
  after insert on public.plans
  for each row execute function public.add_plan_owner();

-- ─────────────────────────────────────────────
-- FRIENDSHIPS
-- ─────────────────────────────────────────────
create type public.friendship_status as enum ('pending', 'accepted', 'blocked');

create table public.friendships (
  id            uuid primary key default uuid_generate_v4(),
  requester_id  uuid not null references public.profiles(id) on delete cascade,
  addressee_id  uuid not null references public.profiles(id) on delete cascade,
  status        public.friendship_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint no_self_friend check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index friendships_addressee_idx on public.friendships (addressee_id);
create index friendships_requester_idx on public.friendships (requester_id);

create trigger friendships_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  plan_id     uuid not null references public.plans(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz,
  constraint content_length check (char_length(content) between 1 and 2000)
);

create index messages_plan_id_idx on public.messages (plan_id, created_at desc);
create index messages_sender_id_idx on public.messages (sender_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.plans       enable row level security;
alter table public.plan_members enable row level security;
alter table public.friendships enable row level security;
alter table public.messages    enable row level security;

-- Profiles: public read, own write
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Plans: public plans visible to all, private only to members
create policy "Public plans are viewable by everyone"
  on public.plans for select
  using (is_public = true or created_by = auth.uid() or
    exists (select 1 from public.plan_members where plan_id = id and user_id = auth.uid()));

create policy "Authenticated users can create plans"
  on public.plans for insert
  with check (auth.uid() = created_by);

create policy "Plan owners can update their plans"
  on public.plans for update
  using (auth.uid() = created_by);

create policy "Plan owners can delete their plans"
  on public.plans for delete
  using (auth.uid() = created_by);

-- Plan members
create policy "Members can view plan membership"
  on public.plan_members for select
  using (exists (select 1 from public.plans p
    where p.id = plan_id and (p.is_public = true or p.created_by = auth.uid() or user_id = auth.uid())));

create policy "Plan owners can manage members"
  on public.plan_members for insert
  with check (exists (select 1 from public.plans p
    where p.id = plan_id and p.created_by = auth.uid()) or user_id = auth.uid());

create policy "Members can update their own RSVP"
  on public.plan_members for update
  using (user_id = auth.uid());

-- Friendships
create policy "Users can view their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Users can update received requests"
  on public.friendships for update
  using (auth.uid() = addressee_id or auth.uid() = requester_id);

-- Messages: only plan members
create policy "Plan members can view messages"
  on public.messages for select
  using (exists (select 1 from public.plan_members
    where plan_id = messages.plan_id and user_id = auth.uid()));

create policy "Plan members can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id and
    exists (select 1 from public.plan_members
      where plan_id = messages.plan_id and user_id = auth.uid() and rsvp = 'accepted'));

create policy "Senders can edit own messages"
  on public.messages for update
  using (auth.uid() = sender_id);

create policy "Senders can delete own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- ─────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.plan_members;
