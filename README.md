# 🏃‍♂️ Runasty

Ranking competitivo de corrida integrado com Strava.

## Stack

Next.js 16 • React 19 • Supabase • NextAuth v5 • Tailwind v4 • Vercel

## Features

- 🔐 OAuth Strava
- 👑 Ranking 5K/10K/21K com "Rei da Montanha"
- 🔄 Webhook sync automático
- 📱 PWA offline-first
- 🌙 Dark mode

## Setup

```bash
cp .env.example .env.local  # Configurar variáveis
npm install && npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor local |
| `npm run build` | Build produção |
| `npx tsx scripts/seed.ts` | Popular banco com dados teste |

## Webhook Strava

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=$STRAVA_CLIENT_ID \
  -F client_secret=$STRAVA_CLIENT_SECRET \
  -F callback_url=https://runasty.vercel.app/api/strava/webhook \
  -F verify_token=$STRAVA_WEBHOOK_VERIFY_TOKEN
```

## Licença

MIT
