/**
 * Sentry - Configuração do Cliente (Browser)
 * 
 * Captura erros no frontend e envia para o Sentry.
 * Configure NEXT_PUBLIC_SENTRY_DSN no .env para ativar.
 */

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Só inicializa se o DSN estiver configurado
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance - captura 10% das transações em produção
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Replay - captura sessões com erro
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    
    // Ambiente
    environment: process.env.NODE_ENV,
    
    // Ignorar erros comuns que não são bugs
    ignoreErrors: [
      // Network errors
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      // User cancellation
      "AbortError",
      "The operation was aborted",
      // Chrome extensions
      "chrome-extension://",
      // Safari
      "webkit-masked-url://",
    ],
    
    // Não enviar dados sensíveis
    beforeSend(event) {
      // Remove tokens de URL
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/access_token=[^&]+/g, "access_token=REDACTED")
      }
      return event
    },
  })
}
