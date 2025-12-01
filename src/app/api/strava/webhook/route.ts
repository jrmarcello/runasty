/**
 * Strava Webhook - Recebe eventos de atividades
 * 
 * Quando um atleta cria/atualiza uma atividade, o Strava envia um POST aqui.
 * Isso permite sync automático sem o usuário precisar abrir o app.
 * 
 * Documentação: https://developers.strava.com/docs/webhooks/
 * 
 * Para configurar:
 * 1. Definir STRAVA_WEBHOOK_VERIFY_TOKEN no .env
 * 2. Registrar webhook no Strava:
 *    curl -X POST https://www.strava.com/api/v3/push_subscriptions \
 *      -F client_id=YOUR_CLIENT_ID \
 *      -F client_secret=YOUR_CLIENT_SECRET \
 *      -F callback_url=https://runasty.vercel.app/api/strava/webhook \
 *      -F verify_token=YOUR_VERIFY_TOKEN
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { syncUserRecords } from "@/lib/strava/sync"
import { refreshStravaToken } from "@/lib/strava/client"

// Supabase admin client para bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tipos de eventos do Strava
interface StravaWebhookEvent {
  object_type: "activity" | "athlete"
  object_id: number
  aspect_type: "create" | "update" | "delete"
  owner_id: number // strava_id do atleta
  subscription_id: number
  event_time: number
}

/**
 * GET - Validação do webhook (handshake inicial)
 * 
 * O Strava envia um GET com hub.challenge para verificar que você controla o endpoint
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Token de verificação definido no .env
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN

  if (!verifyToken) {
    console.error("STRAVA_WEBHOOK_VERIFY_TOKEN não configurado")
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 })
  }

  // Verificar se é uma requisição de validação válida
  if (mode === "subscribe" && token === verifyToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log("✅ Webhook validado com sucesso")
    }
    return NextResponse.json({ "hub.challenge": challenge })
  }

  // Log de segurança mantido (tentativa inválida pode ser ataque)
  console.warn("❌ Tentativa de validação inválida:", { mode, token })
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

/**
 * POST - Recebe eventos do Strava
 * 
 * Quando uma atividade é criada/atualizada, sincroniza os records do usuário
 */
export async function POST(request: NextRequest) {
  try {
    const event: StravaWebhookEvent = await request.json()
    
    if (process.env.NODE_ENV === 'development') {
      console.log("📥 Webhook recebido:", {
        type: event.object_type,
        aspect: event.aspect_type,
        owner: event.owner_id,
        activity: event.object_id,
      })
    }

    // Só processar eventos de atividades (criação ou atualização)
    if (event.object_type !== "activity") {
      return NextResponse.json({ received: true })
    }

    if (event.aspect_type === "delete") {
      return NextResponse.json({ received: true })
    }

    const stravaId = event.owner_id

    // Buscar usuário no banco
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("strava_id, strava_access_token, strava_refresh_token, strava_token_expires_at")
      .eq("strava_id", stravaId)
      .single()

    if (profileError || !profile) {
      // Usuário não usa Runasty - silencioso em prod
      return NextResponse.json({ received: true })
    }

    // Verificar/renovar token (renovar se expira em 1 hora ou menos - recomendação Strava API)
    let accessToken = profile.strava_access_token

    if (profile.strava_token_expires_at) {
      const expiresAt = new Date(profile.strava_token_expires_at)
      const now = new Date()
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

      if (oneHourFromNow >= expiresAt && profile.strava_refresh_token) {
        if (process.env.NODE_ENV === 'development') {
          console.log("🔄 Renovando token expirado para usuário:", stravaId)
        }
        
        try {
          const newTokens = await refreshStravaToken(profile.strava_refresh_token)
          accessToken = newTokens.access_token

          // Atualizar tokens no banco
          await supabaseAdmin
            .from("profiles")
            .update({
              strava_access_token: newTokens.access_token,
              strava_refresh_token: newTokens.refresh_token,
              strava_token_expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
            })
            .eq("strava_id", stravaId)
        } catch (refreshError) {
          console.error("❌ Erro ao renovar token:", refreshError)
          return NextResponse.json({ received: true })
        }
      }
    }

    if (!accessToken) {
      // Usuário sem token - silencioso em prod
      return NextResponse.json({ received: true })
    }

    // Sincronizar records do usuário
    const result = await syncUserRecords(stravaId, accessToken, {
      isAutoSync: true, // Webhook é considerado auto-sync
      force: false,
    })

    if (process.env.NODE_ENV === 'development') {
      if (result.success) {
        console.log("✅ Sync via webhook concluído:", result.message)
      } else {
        console.log("⚠️ Sync via webhook com aviso:", result.message)
      }
    }

    // Sempre retornar 200 para o Strava não reenviar
    return NextResponse.json({ received: true, synced: result.success })

  } catch (error) {
    console.error("❌ Erro no webhook:", error)
    // Retornar 200 mesmo com erro para evitar retentativas do Strava
    return NextResponse.json({ received: true, error: true })
  }
}
