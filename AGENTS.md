# AGENTS.md

Context file for AI agents working on this project.

## Overview

**Runasty** is a competitive running leaderboard powered by Strava. Athletes compete for best times across 5K, 10K, and Half Marathon distances.

Production: [runasty.vercel.app](https://runasty.vercel.app)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Framework | Next.js 16 (App Router, Server Components) |
| UI | React 19, Tailwind CSS v4 |
| Auth | NextAuth.js v5 (Strava OAuth) |
| Database | Supabase PostgreSQL with RLS |
| Deploy | Vercel (Serverless) |

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── profile/        # User profile CRUD + level
│   │   └── strava/
│   │       ├── sync/       # Manual sync endpoint
│   │       └── webhook/    # Strava webhook receiver
│   ├── login/              # Login page
│   ├── profile/            # User insights page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   ├── support/            # Support/FAQ page
│   └── page.tsx            # Main ranking page
├── components/
│   ├── auth/               # LoginButton, PoweredByStrava
│   ├── layout/             # Header, Footer, UserMenu
│   ├── profile/            # ProfileInsights
│   ├── ranking/            # RankingClient, MyRecords
│   └── ui/                 # Avatar, Logo, ThemeToggle
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── strava/
│   │   ├── client.ts       # Strava API v3 client
│   │   └── sync.ts         # Sync logic and King tracking
│   └── supabase/
│       ├── server.ts       # Server client (anon)
│       └── admin.ts        # Admin client (service_role)
└── types/
    ├── database.ts         # Supabase types
    └── next-auth.d.ts      # NextAuth type extensions
```

## Database Schema

```sql
profiles (strava_id PK, username, full_name, avatar_url, sex, tokens..., last_sync_at)
records (strava_id FK, distance_type, time_seconds, achieved_at, strava_activity_id)
ranking_history (strava_id FK, distance_type, started_at, ended_at, record_time_seconds)
```

RLS: `anon` = SELECT only, `service_role` = full access

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | * | NextAuth handlers |
| `/api/profile` | GET | Get current user profile |
| `/api/profile` | DELETE | Delete account (cascade) |
| `/api/profile/level` | GET | Get user level/badge |
| `/api/strava/sync` | POST | Manual sync (5min cooldown) |
| `/api/strava/webhook` | GET/POST | Strava webhook endpoint |

## Sync Flow

```text
Webhook: Strava → POST /api/strava/webhook → syncUserRecords() → DB
Manual:  User → POST /api/strava/sync → syncUserRecords() → DB
```

Token refresh occurs 1 hour before expiration per Strava recommendation.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
STRAVA_WEBHOOK_VERIFY_TOKEN
AUTH_SECRET
NEXTAUTH_URL
```

## Code Conventions

- Imports: Use `@/` alias for src/
- Components: Server Components by default, `"use client"` when needed
- Commits: Conventional Commits (feat:, fix:, refactor:)
- Styling: Tailwind CSS, dark mode with `dark:` prefix

## Business Logic

| Concept | Rule |
|---------|------|
| Distances | 5K, 10K, 21K (Half Marathon) |
| Ranking | Lower time = better position |
| Display | Top 20, user outside sees their card separately |
| Gender | Filters: All, Male (M), Female (F) |
| King | Leader tracked in ranking_history with reign duration |
| Levels | 0=Iniciante, 1=Corredor, 2=Atleta, 3=Maratonista |

## Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint check
vercel env pull          # Pull env vars from Vercel
```
