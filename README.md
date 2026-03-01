# WellnessMD

A wellness app built for medical residents — micro-interventions, community support, and external resources in one place.

## Tech Stack

- **Framework:** Expo (React Native) + TypeScript
- **Backend:** Supabase (Auth, Postgres, Row-Level Security)
- **State Management:** Zustand
- **Navigation:** React Navigation (bottom tabs + stack)
- **Auth:** Email / password via Supabase

## Features

- **Email authentication** — sign up or sign in with email and password
- **Micro-interventions** — guided breathing, stretching, and mindfulness sessions with step-by-step timers
- **Activity logging** — tracks completed sessions, streak, and total minutes (synced to Supabase); analytics (streak, sessions, min total) shown in Profile
- **Community forum** — anonymous posts, comments, likes, and reporting (all persisted in Supabase)
- **External resources** — curated mental health, nutrition, spiritual, and institutional support links
- **Profile management** — edit name, PGY year, specialty, profile photo, notification preferences (synced to Supabase)
- **Dark / Light mode** — full theme support across every screen
- **Anonymized participant IDs** — `P-000001` format for research compliance; no emails exposed in forum

## Project Structure

```
wellnessapp/
├── App.tsx                    # Entry point, navigation + auth hydration
├── auth/
│   └── authService.ts         # Supabase auth helpers (OTP, metadata)
├── components/
│   ├── AppCard.tsx            # Reusable card component
│   └── theme/
│       ├── colors.ts          # Dark + Light color palettes
│       ├── typography.ts      # Font styles
│       └── useColors.ts       # Hook for dynamic theming
├── navigation/
│   ├── MainTabNavigator.tsx   # Bottom tabs (Home, Resources, Community, Profile)
│   ├── RootNavigator.tsx      # Auth vs main stack
│   └── types.ts               # Navigation type definitions
├── screens/
│   ├── ActivityGuideScreen.tsx
│   ├── InstitutionalSignInScreen.tsx
│   ├── PeerSupportScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ResourcesScreen.tsx
│   └── WellnessDashboardScreen.tsx
├── store/
│   ├── appStore.ts            # Zustand global state
│   ├── mockData.ts            # Seed / fallback data
│   └── types.ts               # TypeScript interfaces
├── supabase/
│   ├── client.ts              # Supabase client init
│   ├── api.ts                 # All Supabase CRUD functions
│   └── schema.sql             # Full database schema (run in SQL Editor)
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

4. Set up the database — go to your Supabase dashboard → **SQL Editor** → **New Query**, paste the contents of `supabase/schema.sql`, and click **Run**.

5. (Required for profile photos) Create Storage bucket: Supabase Dashboard → **Storage** → **New bucket** → name `avatars` → enable **Public** → **Create bucket**. Add policy: Storage → avatars → Policies → **New policy** → "Allow authenticated uploads" → allow `INSERT` for `auth.role() = 'authenticated'`.

6. Start the app:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go.

## Database

The schema (`supabase/schema.sql`) creates 9 tables with Row-Level Security:

| Table | Purpose |
|---|---|
| `profiles` | User profile + anonymized participant ID |
| `interventions` | Micro-intervention catalog (admin-populated) |
| `activity_logs` | Completed session tracking |
| `posts` | Community forum posts |
| `post_likes` | Like/unlike tracking |
| `comments` | Threaded comments on posts |
| `reports` | Post flagging/moderation |
| `resources` | External support links (admin-populated) |
| `user_push_tokens` | Expo push notification tokens |

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable anon key |

## License

MIT
