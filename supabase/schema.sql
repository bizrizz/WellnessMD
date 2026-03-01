-- ============================================================
-- WellnessMD — Complete Database Schema
-- ============================================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
--
-- Safe to re-run: uses "if not exists" and "on conflict"
-- Easy to extend: just add new columns with ALTER TABLE
--   e.g.  ALTER TABLE profiles ADD COLUMN timezone text;
--
-- To add a NEW table later, copy any block below as a template.
-- ============================================================


-- ============================================================
-- 1. PARTICIPANT ID SEQUENCE + HELPER
-- ============================================================

create sequence if not exists participant_id_seq start with 1 increment by 1;

create or replace function generate_participant_id()
returns text as $$
begin
  return 'P-' || lpad(nextval('participant_id_seq')::text, 6, '0');
end;
$$ language plpgsql;


-- ============================================================
-- 2. PROFILES  (PRD §3.4 + app fields)
-- ============================================================
-- One row per user, auto-created on signup via trigger.
-- To add a field later:
--   ALTER TABLE profiles ADD COLUMN new_field text;

create table if not exists profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  participant_id           text unique not null default generate_participant_id(),
  full_name                text,
  pgy_year                 text,
  specialty                text,
  primary_stressors        text[] default '{}',
  available_time_minutes   integer default 10,
  notification_frequency   text default 'daily',
  reminder_time_preference text default '08:00',
  onboarding_complete      boolean default false,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- Auto-create a profile when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, pgy_year, specialty)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'pgy_year', 'PGY-1'),
    coalesce(new.raw_user_meta_data->>'specialty', 'Internal Medicine')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at on any profile change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();


-- ============================================================
-- 3. INTERVENTIONS  (PRD §6 — admin-populated catalog)
-- ============================================================
-- Read-only for users. Add new interventions via SQL or dashboard.
--   INSERT INTO interventions (title, category, duration_minutes, description)
--   VALUES ('Power Nap', 'Recovery', 20, 'A short nap to restore energy.');

create table if not exists interventions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  category         text not null,
  duration_minutes integer not null,
  media_url        text,
  description      text,
  created_at       timestamptz default now()
);


-- ============================================================
-- 4. ACTIVITY LOGS  (PRD §6 — tracks completed sessions)
-- ============================================================

create table if not exists activity_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  intervention_id  uuid references interventions(id) on delete set null,
  completed_at     timestamptz default now(),
  duration_minutes integer not null
);

create index if not exists idx_activity_logs_user      on activity_logs(user_id);
create index if not exists idx_activity_logs_completed on activity_logs(completed_at);


-- ============================================================
-- 5. POSTS  (PRD §7 — community forum)
-- ============================================================

create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  content      text not null,
  category     text not null default 'Residency Life',
  is_anonymous boolean default true,
  is_flagged   boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_posts_created  on posts(created_at desc);
create index if not exists idx_posts_category on posts(category);

drop trigger if exists posts_updated_at on posts;
create trigger posts_updated_at
  before update on posts
  for each row execute function set_updated_at();


-- ============================================================
-- 6. POST LIKES  (junction table for like/unlike)
-- ============================================================

create table if not exists post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create index if not exists idx_post_likes_post on post_likes(post_id);


-- ============================================================
-- 7. COMMENTS  (PRD §7)
-- ============================================================

create table if not exists comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references posts(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  is_anonymous boolean default true,
  created_at   timestamptz default now()
);

create index if not exists idx_comments_post on comments(post_id);


-- ============================================================
-- 8. REPORTS  (PRD §7 — flagged posts)
-- ============================================================

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason      text not null,
  created_at  timestamptz default now(),
  unique(post_id, reporter_id)
);


-- ============================================================
-- 9. RESOURCES  (PRD §8 — admin-populated)
-- ============================================================
-- Read-only for users. Add new resources via SQL or dashboard.

create table if not exists resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category     text not null,
  description  text not null,
  contact_info text,
  link         text,
  created_at   timestamptz default now()
);


-- ============================================================
-- 10. USER PUSH TOKENS  (PRD §10)
-- ============================================================

create table if not exists user_push_tokens (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  created_at      timestamptz default now(),
  unique(user_id, expo_push_token)
);


-- ============================================================
-- 11. ROW-LEVEL SECURITY
-- ============================================================

alter table profiles         enable row level security;
alter table interventions    enable row level security;
alter table activity_logs    enable row level security;
alter table posts            enable row level security;
alter table post_likes       enable row level security;
alter table comments         enable row level security;
alter table reports          enable row level security;
alter table resources        enable row level security;
alter table user_push_tokens enable row level security;

-- PROFILES
create policy "Users read own profile"   on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- INTERVENTIONS (read-only for all)
create policy "Anyone can read interventions" on interventions for select using (true);

-- ACTIVITY LOGS
create policy "Users read own logs"   on activity_logs for select using (auth.uid() = user_id);
create policy "Users insert own logs" on activity_logs for insert with check (auth.uid() = user_id);

-- POSTS
create policy "Anyone can read posts"  on posts for select using (true);
create policy "Users insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users delete own posts" on posts for delete using (auth.uid() = user_id);

-- POST LIKES
create policy "Anyone can read likes"   on post_likes for select using (true);
create policy "Users insert own likes"  on post_likes for insert with check (auth.uid() = user_id);
create policy "Users delete own likes"  on post_likes for delete using (auth.uid() = user_id);

-- COMMENTS
create policy "Anyone can read comments"  on comments for select using (true);
create policy "Users insert own comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on comments for delete using (auth.uid() = user_id);

-- REPORTS (one per user per post, enforced by unique constraint)
create policy "Users insert own reports" on reports for insert with check (auth.uid() = reporter_id);

-- RESOURCES (read-only for all)
create policy "Anyone can read resources" on resources for select using (true);

-- PUSH TOKENS
create policy "Users read own tokens"   on user_push_tokens for select using (auth.uid() = user_id);
create policy "Users insert own tokens" on user_push_tokens for insert with check (auth.uid() = user_id);
create policy "Users delete own tokens" on user_push_tokens for delete using (auth.uid() = user_id);


-- ============================================================
-- 12. SEED DATA: Interventions
-- ============================================================

insert into interventions (title, category, duration_minutes, description) values
  ('5-min Breathing',  'Breathing',   5, 'Box breathing and deep belly breaths to calm the nervous system.'),
  ('Quick Stretching', 'Yoga',        8, 'Neck rolls, shoulder shrugs, forward fold, cat-cow, and child''s pose.'),
  ('Rapid Reset',      'Meditation',  3, 'A quick mindfulness pause: observe, ground, and breathe.')
on conflict do nothing;


-- ============================================================
-- 13. SEED DATA: Resources
-- ============================================================

insert into resources (title, category, description, contact_info, link) values
  ('Physician Support Program',   'Mental Health',         'Confidential 24/7 counseling for physicians and residents.',                  '1-888-667-3747', 'https://www.physiciansupportprogram.ca'),
  ('Crisis Text Line',            'Mental Health',         'Text HOME to 741741 to connect with a trained crisis counselor.',             'Text HOME to 741741', null),
  ('MBSR Program',                'Mental Health',         'Evidence-based mindfulness program proven to reduce burnout.',                null, 'https://www.umassmed.edu/cfm/mindfulness-based-programs/mbsr-courses/'),
  ('Meal Planning for Residents', 'Nutrition',             'Simple batch-friendly recipes for residents with limited time.',              null, null),
  ('Hydration & Performance',     'Nutrition',             'How proper hydration during long shifts improves cognitive function.',        null, null),
  ('Sleep Nutrition Guide',       'Nutrition',             'Foods that promote better sleep quality for shift workers.',                  null, null),
  ('Chaplaincy & Spiritual Care', 'Spiritual Support',     'Non-denominational spiritual support services available at most hospitals.',  null, null),
  ('Reflective Practice Groups',  'Spiritual Support',     'Facilitated sessions for processing difficult patient encounters.',           null, null),
  ('Resident Wellness Office',    'Institutional Support', 'Your program likely has a dedicated wellness lead for support.',              null, null),
  ('PARO Wellness Resources',     'Institutional Support', 'Professional Association of Residents of Ontario — wellness and advocacy.',   null, 'https://www.myparo.ca')
on conflict do nothing;


-- ============================================================
-- HOW TO EXTEND LATER
-- ============================================================
--
-- ADD A COLUMN:
--   ALTER TABLE profiles ADD COLUMN timezone text default 'America/Toronto';
--   ALTER TABLE posts ADD COLUMN image_url text;
--
-- ADD A NEW TABLE:
--   create table if not exists your_table (
--     id         uuid primary key default gen_random_uuid(),
--     user_id    uuid not null references auth.users(id) on delete cascade,
--     some_field text not null,
--     created_at timestamptz default now()
--   );
--   alter table your_table enable row level security;
--   create policy "Users read own" on your_table for select using (auth.uid() = user_id);
--   create policy "Users insert own" on your_table for insert with check (auth.uid() = user_id);
--
-- ADD SEED DATA:
--   INSERT INTO resources (title, category, description, link) VALUES
--     ('New Resource', 'Mental Health', 'Description here.', 'https://example.com');
-- ============================================================
