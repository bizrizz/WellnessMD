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

Supabase handles auth, Postgres, and file storage. No custom API server.

### Auth

- **Email/password** — `authService.signInWithEmail`, `signUpWithEmail`
- Session stored in AsyncStorage; `getSession()` used on app load
- On signup, `handle_new_user` trigger creates a `profiles` row with `participant_id` (`P-000001`)

### Database

| Table | Purpose |
|-------|---------|
| `profiles` | User info, avatar_url, PGY, specialty, onboarding |
| `mood_logs` | Daily mood check-ins (Happy/Calm/Relax/Focus) |
| `activity_logs` | Completed micro-interventions (user_id, intervention_id, duration) |
| `interventions` | Catalog of activities (admin seed) |
| `posts` | Community forum posts (anonymous by default) |
| `post_likes` | Like/unlike junction |
| `comments` | Forum comments |
| `reports` | Post flagging |
| `resources` | External links (admin seed) |
| `user_push_tokens` | Expo push tokens |

All tables use RLS; users can only read/write their own data except for posts/comments/resources (read-all, write-own).

### Storage

- **avatars** bucket — public; path `{userId}/avatar.jpg`
- RLS: users INSERT/UPDATE only in their own folder; anyone can SELECT
- `api.uploadAvatar()` accepts `{ uri }` or `{ base64 }`; returns public URL
- Profile `avatar_url` updated via `updateProfileAvatar()`

### API Layer (`supabase/api.ts`)

- **Profiles:** `fetchProfile`, `updateProfile`, `updateProfileAvatar`, `uploadAvatar`
- **Mood:** `logMood`, `fetchMoodLogs`, `fetchTodaysMood`
- **Activity:** `fetchActivityLogs`, `insertActivityLog`
- **Forum:** `fetchPosts`, `createPost`, `deletePost`, `toggleLike`, `fetchComments`, `createComment`, `createReport`
- **Resources:** `fetchResources`

Posts/comments join with `profiles` to show `Resident P-000123` (never email). Graceful no-op when `isSupabaseConfigured` is false (missing env).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## License

MIT
