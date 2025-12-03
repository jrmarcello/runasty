import { auth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

/**
 * API para gerenciar consentimento do usuário
 * Conforme exigido pelo Contrato da API Strava
 * @see https://www.strava.com/legal/api
 */

// GET /api/profile/consent - Verificar status do consentimento
export async function GET() {
  const session = await auth()

  if (!session?.user?.stravaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("consent_public_ranking, consent_at")
      .eq("strava_id", session.user.stravaId)
      .single()

    if (error) {
      console.error("Erro ao buscar consentimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      hasConsent: data?.consent_public_ranking === true,
      consentAt: data?.consent_at || null,
    })
  } catch (error) {
    console.error("Erro ao verificar consentimento:", error)
    return NextResponse.json(
      { error: "Erro ao verificar consentimento" },
      { status: 500 }
    )
  }
}

// POST /api/profile/consent - Salvar consentimento
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.stravaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { consent } = body

    if (typeof consent !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'consent' deve ser boolean" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        consent_public_ranking: consent,
        consent_at: consent ? new Date().toISOString() : null,
      })
      .eq("strava_id", session.user.stravaId)

    if (error) {
      console.error("Erro ao salvar consentimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      hasConsent: consent,
      consentAt: consent ? new Date().toISOString() : null,
    })
  } catch (error) {
    console.error("Erro ao salvar consentimento:", error)
    return NextResponse.json(
      { error: "Erro ao salvar consentimento" },
      { status: 500 }
    )
  }
}

// DELETE /api/profile/consent - Revogar consentimento
export async function DELETE() {
  const session = await auth()

  if (!session?.user?.stravaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        consent_public_ranking: false,
        consent_at: null,
      })
      .eq("strava_id", session.user.stravaId)

    if (error) {
      console.error("Erro ao revogar consentimento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Consentimento revogado. Seus dados foram removidos do ranking público.",
    })
  } catch (error) {
    console.error("Erro ao revogar consentimento:", error)
    return NextResponse.json(
      { error: "Erro ao revogar consentimento" },
      { status: 500 }
    )
  }
}
