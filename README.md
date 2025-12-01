# Runasty

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://runasty.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com)
[![Strava API](https://img.shields.io/badge/Strava-API%20v3-FC4C02?logo=strava)](https://developers.strava.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Competitive running leaderboard powered by Strava. Athletes compete for the best times across 5K, 10K, and Half Marathon distances.

## Features

- **OAuth Integration** — Secure authentication via Strava
- **Live Rankings** — Leaderboards for 5K, 10K, and 21K with gender filters
- **King of the Mountain** — Track leadership duration for each distance
- **Auto Sync** — Real-time updates via Strava webhooks
- **Athlete Insights** — Personal stats, percentile rankings, and progress tracking
- **PWA Support** — Installable on mobile with offline capabilities
- **Dark Mode** — System-aware theme switching

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Server Components) |
| Runtime | Node.js 20+, React 19 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | NextAuth.js v5 (Strava OAuth) |
| Styling | Tailwind CSS v4 |
| Deploy | Vercel (Serverless) |

## Getting Started

### Prerequisites

- Node.js 20+
- Strava API credentials ([create app](https://www.strava.com/settings/api))
- Supabase project ([create project](https://supabase.com))

### Installation

```bash
git clone https://github.com/jrmarcello/runasty.git
cd runasty
cp .env.example .env.local
npm install
npm run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Strava OAuth
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_WEBHOOK_VERIFY_TOKEN=

# NextAuth
AUTH_SECRET=
NEXTAUTH_URL=
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | `*` | NextAuth handlers |
| `/api/profile` | `GET` | Fetch authenticated user profile |
| `/api/profile` | `DELETE` | Delete user account |
| `/api/strava/sync` | `POST` | Manual sync trigger |
| `/api/strava/webhook` | `GET/POST` | Strava webhook endpoint |

## Webhook Setup

Register the webhook subscription with Strava:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=$STRAVA_CLIENT_ID \
  -F client_secret=$STRAVA_CLIENT_SECRET \
  -F callback_url=https://your-domain.com/api/strava/webhook \
  -F verify_token=$STRAVA_WEBHOOK_VERIFY_TOKEN
```

## Project Structure

```text
src/
├── app/                 # App Router pages and API routes
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── layout/         # Header, Footer, UserMenu
│   ├── profile/        # Athlete insights
│   ├── ranking/        # Leaderboard components
│   └── ui/             # Primitives (Avatar, Logo)
├── lib/
│   ├── auth.ts         # NextAuth configuration
│   ├── strava/         # Strava API client and sync logic
│   └── supabase/       # Database clients
└── types/              # TypeScript definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/seed.ts` | Seed database with test data |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
