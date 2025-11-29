# 🏃‍♂️ Runasty

Ranking competitivo de recordes pessoais no Strava com sistema de "Rei da Montanha".

## ✨ Funcionalidades

- 🔐 Login via Strava OAuth
- 📊 Ranking de RPs (5k, 10k, 21k)
- 👑 Sistema "Rei da Montanha" com contador de tempo na liderança
- 🎯 Filtros por gênero (Geral, Masculino, Feminino)
- 🔄 Sincronização inteligente com rate limiting
- 📱 PWA instalável (funciona offline)
- 🌙 Tema claro/escuro
- 🔔 Webhook para sync automático

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19
- **Backend:** Supabase (PostgreSQL + RLS)
- **Auth:** NextAuth.js v5 + Strava OAuth
- **Styling:** Tailwind CSS v4
- **Monitoramento:** Sentry (opcional)
- **Deploy:** Vercel

## 🚀 Setup

1. Clone o repositório
2. Copie `.env.example` para `.env.local`
3. Configure as variáveis de ambiente
4. `npm install && npm run dev`

### Configurar Webhook do Strava (opcional)

Para receber atualizações automáticas quando você corre:

```bash
# Gerar token de verificação
openssl rand -hex 32

# Registrar webhook no Strava
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=SEU_CLIENT_ID \
  -F client_secret=SEU_CLIENT_SECRET \
  -F callback_url=https://runasty.vercel.app/api/strava/webhook \
  -F verify_token=SEU_VERIFY_TOKEN
```

## 📄 Licença

MIT - Veja [LICENSE](LICENSE)

---

Feito com ❤️ e 🏃
