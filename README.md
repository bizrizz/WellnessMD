# WellnessMD

A wellness app built for medical residents — micro-interventions, community support, and external resources in one place.

## Tech Stack

- **Framework:** Expo (React Native) + TypeScript
- **Backend:** Supabase (Auth, Postgres, Storage, Row-Level Security)
- **State Management:** Zustand
- **Navigation:** React Navigation (bottom tabs + stack)
- **Auth:** Email / password via Supabase
- **Fonts:** Playfair Display (headings) + Lato (body) via `@expo-google-fonts`

## Features

- **Email authentication** — sign up or sign in with email and password
- **Micro-interventions** — guided breathing, stretching, and mindfulness sessions with step-by-step timers
- **Activity logging** — tracks completed sessions, streak, and total minutes (synced to Supabase); analytics (streak, sessions, min total) shown in Profile
- **Daily mood check-in** — Happy, Calm, Relax, Focus (one per day, persisted to Supabase)
- **Community forum** — anonymous posts, comments, likes, and reporting (all persisted in Supabase)
- **External resources** — curated mental health, nutrition, spiritual, and institutional support links
- **Profile management** — edit name, PGY year, specialty, profile photo, notification preferences (synced to Supabase)
- **Dark / Light mode** — full theme support across every screen
- **Anonymized participant IDs** — `P-000001` format for research compliance; no emails exposed in forum

## Project Structure

```
wellnessapp/
├── App.tsx                    # Entry point, fonts, session check, splash → main app
├── auth/
│   └── authService.ts        # Supabase auth (signIn, signUp, signOut, OTP, metadata)
├── components/
│   ├── AppCard.tsx
│   ├── SplashScreen.tsx      # Animated splash (Playfair Display + Lato)
│   └── theme/
│       ├── colors.ts         # Dark + Light color palettes
│       ├── typography.ts     # Shared font styles
│       └── useColors.ts
├── navigation/
│   ├── MainTabNavigator.tsx  # Bottom tabs (Home, Resources, Community, Profile)
│   ├── RootNavigator.tsx     # Auth vs main stack
│   └── types.ts
├── screens/
│   ├── ActivityGuideScreen.tsx
│   ├── InstitutionalSignInScreen.tsx
│   ├── PeerSupportScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ResourcesScreen.tsx
│   └── WellnessDashboardScreen.tsx
├── store/
│   ├── appStore.ts
│   ├── mockData.ts
│   └── types.ts
├── supabase/
│   ├── client.ts             # Supabase client + isSupabaseConfigured
│   ├── api.ts                # All backend CRUD functions
│   └── schema.sql            # Full DB schema + storage RLS (run in SQL Editor)
├── app.json
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app on your iOS device
- A Supabase project

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/bizrizz/WellnessMD.git
   cd WellnessMD
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase project URL and anon key.

4. Set up the database — Supabase Dashboard → **SQL Editor** → **New Query** → paste `supabase/schema.sql` → **Run**.

5. **Profile photos:** Create `avatars` bucket: Dashboard → **Storage** → **New bucket** → name `avatars` → **Public** → Create. The storage policies are already in `schema.sql` (run the full file).

6. Start the app:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go.

---

## Backend Summary (for Devs)

Supabase is the backend: Auth, Postgres, and Storage. No custom API server. All backend calls go through `supabase/client.ts` and `supabase/api.ts`.

### Architecture

```
App (Expo)
    │
    ├── auth/authService.ts     → Supabase Auth (signIn, signUp, signOut)
    ├── supabase/api.ts         → CRUD to Postgres + Storage
    └── store/appStore.ts       → Zustand (in-memory; hydrated from Supabase on login)
```

**Data flow:** On app load, `App.tsx` calls `getSession()` → if session exists, `fetchProfile()` populates `appStore.currentUser`. Screens read from the store and call `api.*` when mutating. After mutations, the store is updated locally (e.g. `logMood` + `hydrateMoodLogs`).

### Auth (`auth/authService.ts`)

| Function | Purpose |
|----------|---------|
| `signInWithEmail(email, password)` | Sign in; returns `{ data, error }` |
| `signUpWithEmail(email, password)` | Sign up; triggers `handle_new_user` → creates `profiles` row |
| `signOut()` | Clear session |
| `getSession()` | Used on app load to restore session |
| `updateUserProfileMetadata(updates)` | Update `auth.users.raw_user_meta_data` (full_name, pgy_year, specialty) |
| `requestEmailOtp` / `verifyEmailOtp` | Magic link (available but not used in main flow) |

Session is persisted in AsyncStorage. On signup, DB trigger `handle_new_user` creates a `profiles` row with `participant_id` (`P-000001` format). Sign-up screen calls `updateUserProfileMetadata` after signup to set full_name, pgy_year, specialty.

### Database (`supabase/schema.sql`)

Run the full `schema.sql` once in Supabase SQL Editor. It creates tables, RLS, triggers, storage policies, and seed data.

| Table | Key columns | RLS |
|-------|-------------|-----|
| `profiles` | id, participant_id, full_name, avatar_url, pgy_year, specialty | Own data only |
| `mood_logs` | user_id, mood, logged_at | Own data only |
| `activity_logs` | user_id, intervention_id, duration_minutes, completed_at | Own data only |
| `interventions` | title, category, duration_minutes | Read-only (admin seed) |
| `posts` | user_id, title, content, category, is_anonymous, is_flagged | Read all; write own |
| `post_likes` | post_id, user_id | Read all; write own |
| `comments` | post_id, user_id, content, is_anonymous | Read all; write own |
| `reports` | post_id, reporter_id, reason | Insert own only |
| `resources` | title, category, description, link | Read-only (admin seed) |
| `user_push_tokens` | user_id, expo_push_token | Own data only |

**Anonymity:** Forum displays `Resident P-000123` (from `profiles.participant_id`) when `is_anonymous=true`. Never expose email or UUID in UI.

### Storage (avatars)

- **Bucket:** `avatars` (public)
- **Path:** `{userId}/avatar.jpg`
- **RLS:** Users can INSERT/UPDATE only in their folder; anyone can SELECT

Create the bucket in Supabase Dashboard → Storage before first avatar upload. Policies are in `schema.sql`.

**React Native note:** `uploadAvatar()` accepts `{ uri }` (fetched to blob) or `{ base64 }` (decoded to ArrayBuffer). Use base64 when `file://` fetch fails (e.g. some image pickers).

### API Functions (`supabase/api.ts`)

All functions return early with no-op (`{ data: null, error: null }` or empty arrays) when `isSupabaseConfigured` is false (missing env). No thrown errors for config issues.

**Profiles**
| Function | Returns | Used by |
|----------|---------|---------|
| `fetchProfile(userId)` | `{ data, error }` | App.tsx (session restore), SignInScreen (after signup/signin) |
| `updateProfile(userId, updates)` | `{ data, error }` | ProfileScreen (name, PGY, specialty, reminder_time) |
| `updateProfileAvatar(userId, url)` | `{ data, error }` | ProfileScreen (after upload) |
| `uploadAvatar(userId, { uri } or { base64 })` | `{ url, error }` | ProfileScreen (avatar picker) |

**Mood**
| Function | Returns | Used by |
|----------|---------|---------|
| `logMood(userId, mood)` | `{ data, error }` | WellnessDashboardScreen (daily check-in) |
| `fetchMoodLogs(userId, limit?)` | `{ data, error }` | WellnessDashboardScreen (hydrate on load) |
| `fetchTodaysMood(userId)` | `{ mood, error }` | WellnessDashboardScreen (pre-fill if already logged) |

**Activity**
| Function | Returns | Used by |
|----------|---------|---------|
| `fetchActivityLogs(userId)` | `{ data, error }` | WellnessDashboardScreen (hydrate) |
| `insertActivityLog(userId, interventionId, durationMinutes)` | `{ data, error }` | ActivityGuideScreen (on completion) |

**Forum**
| Function | Returns | Used by |
|----------|---------|---------|
| `fetchPosts(currentUserId)` | `{ posts, error }` — enriched with author_alias, like_count, comment_count, is_liked | PeerSupportScreen |
| `createPost(userId, title, content, category, isAnonymous)` | `{ data, error }` | PeerSupportScreen |
| `deletePost(postId)` | `{ error }` | PeerSupportScreen |
| `toggleLike(postId, userId, isCurrentlyLiked)` | `{ error }` | PeerSupportScreen |
| `fetchComments(postId)` | `{ comments, error }` — enriched with author_alias | PeerSupportScreen |
| `createComment(postId, userId, content, isAnonymous)` | `{ data, error }` | PeerSupportScreen |
| `createReport(postId, reporterId, reason)` | `{ error }` | PeerSupportScreen |

**Resources**
| Function | Returns | Used by |
|----------|---------|---------|
| `fetchResources()` | `{ data, error }` | ResourcesScreen |

### Sync pattern

1. **Login:** `getSession()` → `fetchProfile()` → `signIn()` with profile data → `hydrateActivityLogs()`, `hydrateMoodLogs()`
2. **Mutations:** Call `api.*` then update store (e.g. `logMood()` + `logMoodStore()`)
3. **Activity completion:** `insertActivityLog()` + `logActivity()` in parallel

### Extending the schema

See the "HOW TO EXTEND LATER" block at the end of `schema.sql` for ALTER TABLE and new table examples. Schema is designed to be safe to re-run (if not exists, on conflict do nothing).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## License

MIT
