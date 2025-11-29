/**
 * API Route: Sincronizar dados do Strava
 * Issue #5: Serviço de Sincronização
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { syncUserRecords } from "@/lib/strava/sync"

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { id, stravaId, accessToken } = session.user

    if (!stravaId || !accessToken) {
      return NextResponse.json(
        { error: "Dados do Strava não encontrados na sessão" },
        { status: 400 }
      )
    }

    const result = await syncUserRecords(id, stravaId, accessToken)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      records: result.records,
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
