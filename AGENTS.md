# AGENTS.md

Contexto otimizado para agentes de IA trabalhando neste projeto.

## Projeto

**Runasty** - Ranking competitivo de corrida com Strava. Usuários competem por melhores tempos em 5K, 10K e 21K.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Next.js 16 (App Router, Server Components)
- **UI:** React 19, Tailwind CSS v4
- **Auth:** NextAuth.js v5 (Strava OAuth)
- **Database:** Supabase PostgreSQL com RLS
- **Deploy:** Vercel (serverless)

## Estrutura

```text
src/
├── app/                    # App Router (pages, layouts, API routes)
│   ├── api/
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── profile/       # CRUD perfil usuário
│   │   └── strava/
│   │       ├── sync/      # Sync manual
│   │       └── webhook/   # Webhook Strava (POST events)
│   ├── login/
│   └── page.tsx           # Ranking principal
├── components/
│   ├── auth/              # Login, providers
│   ├── layout/            # Header, Footer, UserMenu
│   ├── ranking/           # RankingCard, MyRecords
│   ├── pwa/               # InstallPrompt, PWARegister
│   └── ui/                # Primitivos (Logo, Avatar, ThemeToggle)
├── hooks/                 # useAutoSync
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── strava/            # client.ts, sync.ts
│   └── supabase/          # server.ts, admin.ts, middleware.ts
├── providers/             # SyncProvider, ThemeProvider
└── types/                 # database.ts, next-auth.d.ts
```

## Database (Supabase)

### Tabelas

```sql
profiles (strava_id PK, username, full_name, avatar_url, sex, last_sync_at, tokens...)
records (strava_id FK, distance_type, time_seconds, achieved_at, strava_activity_id)
ranking_history (strava_id FK, distance_type, started_at, ended_at, record_time_seconds)
```

### RLS

- `anon` key: SELECT only (leitura pública)
- `service_role` key: Full access (usado no webhook e admin)

## API Routes

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/*` | * | NextAuth handlers |
| `/api/profile` | GET | Buscar perfil do usuário logado |
| `/api/profile` | DELETE | Encerrar conta |
| `/api/strava/sync` | POST | Sync manual (cooldown 5min) |
| `/api/strava/webhook` | GET | Validação webhook Strava |
| `/api/strava/webhook` | POST | Recebe eventos de atividade |

## Fluxo de Sync

1. **Webhook (automático):** Strava POST → `/api/strava/webhook` → `syncUserRecords()`
2. **Manual:** Usuário clica "Forçar Sincronização" → `/api/strava/sync`

## Convenções

- **Commits:** Conventional Commits (feat:, fix:, refactor:, etc.)
- **Lint:** ESLint + Husky pre-commit
- **Imports:** Usar `@/` para src/
- **Componentes:** Server Components por padrão, "use client" quando necessário
- **Estilo:** Tailwind classes, dark mode com `dark:` prefix

## Variáveis de Ambiente

```env
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
AUTH_SECRET
NEXTAUTH_URL

# Webhook
STRAVA_WEBHOOK_VERIFY_TOKEN

# Opcionais
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_PIX_KEY
```

## Comandos Úteis

```bash
npm run dev              # Dev server
npm run build            # Build produção
npx tsx scripts/seed.ts  # Popular banco com dados teste
vercel env pull          # Baixar env vars da Vercel
```

## Padrões de Código

### Server Component (padrão)

```tsx
// src/app/page.tsx
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### Client Component

```tsx
// src/components/ui/button.tsx
"use client"
import { useState } from "react"
export function Button() { ... }
```

### API Route

```tsx
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"
export async function GET(request: NextRequest) {
  return NextResponse.json({ data })
}
```

## Contexto de Negócio

- **Distâncias:** 5K, 10K, 21K (meia maratona)
- **Ranking:** Menor tempo = melhor posição
- **Rei da Montanha:** Líder de cada distância, com tempo de reinado
- **Filtros:** Geral, Masculino (M), Feminino (F)
- **Top 20:** Ranking mostra apenas top 20, usuário fora vê seu card separado
