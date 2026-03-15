-- ============================================================
-- MTHR App — Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ENUMS ──────────────────────────────────────────────────
create type submission_category as enum (
  'family_documentary',
  'motherhood',
  'fatherhood',
  'newborn',
  'love_couples',
  'editorial'
);

create type submission_status as enum (
  'pending',
  'approved',
  'featured',
  'rejected'
);

-- ── PROFILES ───────────────────────────────────────────────
-- Extends Supabase auth.users with photographer profile data
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  full_name text,
  username text unique,
  bio text,
  website text,
  instagram text,
  location text,
  avatar_url text,
  is_featured boolean default false not null,
  submission_count int default 0 not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── SUBMISSIONS ────────────────────────────────────────────
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  photographer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location_name text not null,
  location_country text not null,
  location_lat numeric(10, 7),
  location_lng numeric(10, 7),
  category submission_category not null,
  status submission_status default 'pending' not null,
  is_magazine_featured boolean default false not null,
  magazine_issue text,
  view_count int default 0 not null,
  images text[] default '{}' not null,
  cover_image text
);

-- Update submission count on profile when submission added
create or replace function public.update_submission_count()
returns trigger as $$
begin
  update public.profiles
  set submission_count = (
    select count(*) from public.submissions
    where photographer_id = new.photographer_id
    and status in ('approved', 'featured')
  )
  where id = new.photographer_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_submission_status_change
  after insert or update of status on public.submissions
  for each row execute procedure public.update_submission_count();

-- ── PLACES ─────────────────────────────────────────────────
create table public.places (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  name text not null,
  country text not null,
  region text,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  session_count int default 0 not null,
  cover_image text,
  description text,
  is_featured boolean default false not null
);

-- Seed initial places
insert into public.places (name, country, region, lat, lng, session_count, is_featured) values
  ('Tuscany', 'Italy', 'Central Italy', 43.7711, 11.2486, 48, true),
  ('Algarve', 'Portugal', 'Southern Portugal', 37.0179, -7.9307, 34, true),
  ('Kyoto', 'Japan', 'Kansai', 35.0116, 135.7681, 27, true),
  ('Oaxaca', 'Mexico', 'Southern Mexico', 17.0732, -96.7266, 21, true),
  ('Cape Town', 'South Africa', 'Western Cape', -33.9249, 18.4241, 19, true),
  ('Bali', 'Indonesia', 'Lesser Sunda Islands', -8.3405, 115.0920, 31, true),
  ('Provence', 'France', 'Southern France', 43.9352, 6.0679, 16, false),
  ('Aspen', 'USA', 'Colorado', 39.1911, -106.8175, 23, false);

-- ── MAGAZINE ISSUES ────────────────────────────────────────
create table public.magazine_issues (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now() not null,
  issue_number int unique not null,
  title text not null,
  subtitle text,
  cover_image text,
  published_at timestamptz,
  is_published boolean default false not null,
  sections jsonb default '[]' not null
);

-- Seed Issue 04
insert into public.magazine_issues (issue_number, title, subtitle, is_published, published_at, sections)
values (4, 'MTHR Magazine', 'Documentary Honest Imagery', true, now(), '[
  {"num": "01", "title": "WELCOME", "subtitle": "A letter from the founder"},
  {"num": "02", "title": "ABOUT", "subtitle": "What MTHR stands for"},
  {"num": "03", "title": "APPROACH", "subtitle": "How we see the world"},
  {"num": "05", "title": "MY PROCESS", "subtitle": "Behind documentary photography"},
  {"num": "07", "title": "PHILOSOPHY", "subtitle": "Documentary honest imagery"},
  {"num": "08", "title": "COLLECTIONS", "subtitle": "Curated series by location"},
  {"num": "13", "title": "PLACES", "subtitle": "The world''s best family locations"},
  {"num": "15", "title": "FEATURED", "subtitle": "Sarah Okafor · Lagos"}
]');

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.places enable row level security;
alter table public.magazine_issues enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Submissions: approved/featured are public; owner can see all their own
create policy "Approved submissions are public"
  on public.submissions for select
  using (status in ('approved', 'featured') or photographer_id = auth.uid());

create policy "Authenticated users can insert submissions"
  on public.submissions for insert
  with check (auth.uid() = photographer_id);

create policy "Owners can update own submissions"
  on public.submissions for update
  using (auth.uid() = photographer_id);

-- Places: fully public read
create policy "Places are publicly readable"
  on public.places for select using (true);

-- Magazine: published issues are public
create policy "Published issues are public"
  on public.magazine_issues for select using (is_published = true);

-- ── STORAGE BUCKETS ────────────────────────────────────────
-- Run these in Supabase dashboard → Storage
-- Or via the API after creating the buckets manually:
--
-- Bucket: "submissions"  (public: false, max size: 50MB)
-- Bucket: "avatars"      (public: true,  max size: 5MB)
-- Bucket: "magazine"     (public: true,  max size: 100MB)
