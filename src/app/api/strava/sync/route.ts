/**
 * API Route: Sincronizar dados do Strava
 * Issue #5: Serviço de Sincronização
 * 
 * Estratégia de Rate Limiting:
 * - Sync manual: cooldown de 15 minutos
 * - Sync automático: cooldown de 60 minutos
 * - Parâmetro force para bypass (admin)
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { syncUserRecords } from "@/lib/strava/sync"
import { createAdminClient } from "@/lib/supabase/admin"
import { refreshStravaToken } from "@/lib/strava/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { stravaId } = session.user

    if (!stravaId) {
      return NextResponse.json(
        { error: "Strava ID não encontrado na sessão" },
        { status: 400 }
      )
    }

    // Ler opções do body (opcional)
    let isAutoSync = false
    let force = false
    let fullSync = false
    
    try {
      const body = await request.json()
      isAutoSync = body?.isAutoSync === true
      force = body?.force === true
      fullSync = body?.fullSync === true
    } catch {
      // Body vazio ou inválido - usar valores padrão
    }

    // Buscar tokens do banco de dados (mais atualizados)
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("strava_access_token, strava_refresh_token, strava_token_expires_at")
      .eq("strava_id", stravaId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      )
    }

    type ProfileTokens = {
      strava_access_token: string | null
      strava_refresh_token: string | null
      strava_token_expires_at: string | null
    }
    const tokens = profile as ProfileTokens

    let accessToken = tokens.strava_access_token

    // Verificar se token expirou
    if (tokens.strava_token_expires_at) {
      const expiresAt = new Date(tokens.strava_token_expires_at)
      const now = new Date()

      if (now >= expiresAt && tokens.strava_refresh_token) {
        // Token expirado, fazer refresh
        try {
          const newTokens = await refreshStravaToken(tokens.strava_refresh_token)
          accessToken = newTokens.access_token

          // Atualizar tokens no banco
          await supabase
            .from("profiles")
            .update({
              strava_access_token: newTokens.access_token,
              strava_refresh_token: newTokens.refresh_token,
              strava_token_expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
            } as never)
            .eq("strava_id", stravaId)
        } catch {
          return NextResponse.json(
            { error: "Erro ao renovar token do Strava. Faça login novamente." },
            { status: 401 }
          )
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token de acesso não encontrado. Faça login novamente." },
        { status: 401 }
      )
    }

    const result = await syncUserRecords(stravaId, accessToken, { isAutoSync, force, fullSync })

    // Se foi pulado por cooldown, retornar 200 com skipped
    if (result.skipped) {
      return NextResponse.json({
        message: result.message,
        skipped: true,
        apiCalls: result.apiCalls,
      })
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.error, apiCalls: result.apiCalls },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      records: result.records,
      apiCalls: result.apiCalls,
    })
  } catch (error) {
    console.error("Erro na API de sync:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Use POST para sincronizar" },
    { status: 405 }
  )
}
