# WellnessMD – Final Technical Product Requirements Document

---

## 1. Technical Overview

| Field | Value |
|---|---|
| **App Name** | WellnessMD |
| **Platform** | iOS (initial release) |
| **Framework** | Expo (React Native) |
| **Language** | TypeScript |
| **Backend** | Supabase (Auth + Postgres + Storage) |
| **State Management** | Zustand |
| **Navigation** | Expo Router |
| **Push Notifications** | Expo Notifications |
| **Analytics** | SDK-based analytics provider (e.g., PostHog / Amplitude / Mixpanel) |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
Mobile App (Expo + TypeScript)
         ↓
  Supabase Backend
    • Authentication
    • PostgreSQL Database
    • Row-Level Security
    • Storage (optional)

  Parallel:
  Analytics SDK
    • Session tracking
    • Screen tracking
    • Event tracking
    • Link click tracking
```

- No weekly recap system.
- No scheduled backend jobs.

---

## 3. Research & Anonymization Architecture

### 3.1 Core Requirement

Each user must be assigned a unique anonymized **Participant ID** upon account creation.

This Participant ID:
- Is used for research data analysis
- Is shown in-app (if needed)
- Is used for analytics SDK identification
- Is used for research exports

Emails are never displayed publicly.

### 3.2 Identity Layers

| Layer | Purpose |
|---|---|
| `auth.users.id` | Internal Supabase UUID (never exposed) |
| `participant_id` | Human-readable anonymized study ID (used for research) |
| forum alias | Derived from `participant_id` |

### 3.3 Participant ID Format

Format:

```
P-000001
P-000002
```

Generated via database sequence.

Must be:
- Unique
- Immutable
- Assigned once

### 3.4 Updated Database: `profiles`

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | References `auth.users.id` |
| `participant_id` | text | Unique anonymized ID |
| `primary_stressors` | text[] | |
| `available_time_minutes` | integer | |
| `notification_frequency` | text | |
| `reminder_time_preference` | text | |
| `onboarding_complete` | boolean | |
| `created_at` | timestamp | |

Unique constraint required on `participant_id`.

---

## 4. Authentication Module

### Features

- Email/password signup
- Email/password login
- Session persistence
- Logout
- Onboarding gating

### Flow

1. User signs up via Supabase Auth
2. Profile record created
3. Participant ID assigned
4. Onboarding required before app access

---

## 5. Onboarding Module

### Data Collected

- Primary stressors
- Available time (minutes)
- Notification frequency
- Reminder timing

### Logic

- Save to `profiles`
- Set `onboarding_complete = true`
- Redirect to Home

---

## 6. Micro-Interventions Module

### Categories

- Yoga
- Breathing
- Meditation

### Database: `interventions`

| Field | Type |
|---|---|
| `id` | uuid |
| `title` | text |
| `category` | text |
| `duration_minutes` | integer |
| `media_url` | text |
| `description` | text |
| `created_at` | timestamp |

### Activity Logging

#### Database: `activity_logs`

| Field | Type |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `intervention_id` | uuid |
| `completed_at` | timestamp |
| `duration_minutes` | integer |

Used for:
- Personal analytics dashboard
- Research data exports

---

## 7. Community Forum Module

### Features

- Anonymous posts
- Threaded comments
- Reporting system
- Moderation flagging

### Database: `posts`

| Field | Type |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `content` | text |
| `created_at` | timestamp |
| `is_flagged` | boolean |

### Database: `comments`

| Field | Type |
|---|---|
| `id` | uuid |
| `post_id` | uuid |
| `user_id` | uuid |
| `content` | text |
| `created_at` | timestamp |

### Database: `reports`

| Field | Type |
|---|---|
| `id` | uuid |
| `post_id` | uuid |
| `reporter_id` | uuid |
| `reason` | text |
| `created_at` | timestamp |

### Anonymity Display Rule

Forum UI must display:

```
Resident P-000123
```

or shortened:

```
Resident 0123
```

Never display:
- Email
- UUID
- Any identifiable data

---

## 8. External Resources Module

### Database: `resources`

| Field | Type |
|---|---|
| `id` | uuid |
| `title` | text |
| `category` | text |
| `description` | text |
| `contact_info` | text |
| `link` | text |

Categories:
- Mental Health
- Nutrition
- Spiritual Support
- Institutional Support

---

## 9. Analytics System (SDK-Based)

### 9.1 Purpose

Collect research-grade behavioral data including:
- Session duration
- Screen views
- Intervention starts/completions
- Link clicks
- Forum engagement
- Feature usage frequency

### 9.2 Implementation

Integrate analytics SDK.

Options:
- **PostHog** (recommended for research)
- Amplitude
- Mixpanel

### 9.3 Identification Strategy

Upon login:

```ts
analytics.identify(participant_id)
```

Never identify via:
- Email
- UUID

Participant ID must be the only identifier sent to analytics.

### 9.4 Required Events

**Core Events:**
- `app_opened`
- `session_started`
- `session_ended`
- `screen_viewed`
- `intervention_started`
- `intervention_completed`
- `activity_logged`
- `forum_post_created`
- `forum_comment_created`
- `resource_link_clicked`
- `push_notification_opened`

### 9.5 Event Properties

Each event must include:

| Property | Description |
|---|---|
| `participant_id` | Anonymized ID |
| `timestamp` | Auto-generated |
| `screen_name` | If applicable |
| `category` | If applicable |
| `duration` | If applicable |

### 9.6 Session Tracking

SDK must automatically:
- Track session start
- Track session end
- Measure session duration

Manual session tracking not required if SDK supports auto-tracking.

---

## 10. Push Notifications

### Supported

- Personalized wellness reminders
- Based on onboarding preferences

### Database: `user_push_tokens`

| Field | Type |
|---|---|
| `id` | uuid |
| `user_id` | uuid |
| `expo_push_token` | text |
| `created_at` | timestamp |

No weekly recap push.

---

## 11. Navigation Structure (Expo Router)

```
app/
  (auth)/
    login.tsx
    register.tsx
    onboarding.tsx
  (tabs)/
    home.tsx
    community.tsx
    resources.tsx
    profile.tsx
```

Tabs:
- Home
- Community
- Resources
- Profile

---

## 12. State Management (Zustand)

### Stores

- `authStore`
- `profileStore`
- `interventionStore`
- `activityStore`
- `forumStore`

### Responsibilities

- Session state
- Profile caching
- Intervention data
- Activity logs
- Forum state

---

## 13. Security & Compliance

- Supabase Row-Level Security enabled
- Users can only read/write their own data
- Forum moderation required
- No PHI stored
- Email never publicly exposed
- Analytics contains anonymized `participant_id` only
- Suitable for institutional research deployment

---

## 14. MVP Scope

### Included

- Auth
- Anonymized participant ID system
- Onboarding
- Micro-interventions
- Activity logging
- Forum
- External resources
- SDK analytics tracking
- Personalized push reminders
- Real-time analytics dashboard (in-app)
