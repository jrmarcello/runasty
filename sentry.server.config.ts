/**
 * Sentry - Configuração do Servidor (Node.js)
 * 
 * Captura erros nas API Routes e SSR.
 * Configure SENTRY_DSN no .env para ativar.
 */

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

// Só inicializa se o DSN estiver configurado
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance - captura 10% das transações em produção
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Ambiente
    environment: process.env.NODE_ENV,
    
    // Não enviar dados sensíveis
    beforeSend(event) {
      // Remove tokens de headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"]
        delete event.request.headers["cookie"]
      }
      return event
    },
  })
}
