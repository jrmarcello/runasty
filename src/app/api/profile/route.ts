import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import type { Profile } from "@/types/database"

// API para verificar o perfil do usuário no Supabase
// GET /api/profile
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('strava_id', session.user.stravaId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const profile = data as Profile

    // Remove tokens sensíveis da resposta
    const safeProfile = {
      ...profile,
      strava_access_token: profile.strava_access_token ? "***" : null,
      strava_refresh_token: profile.strava_refresh_token ? "***" : null,
    }

    return NextResponse.json(safeProfile)
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar perfil" }, 
      { status: 500 }
    )
  }
}

// DELETE /api/profile - Encerrar conta do usuário
export async function DELETE() {
  const session = await auth()

  if (!session?.user?.stravaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const stravaId = session.user.stravaId

  try {
    // Usar admin client para bypasser RLS (NextAuth não autentica no Supabase)
    const supabase = createAdminClient()

    // 1. Deletar records do usuário
    const { error: recordsError } = await supabase
      .from('records')
      .delete()
      .eq('strava_id', stravaId)

    if (recordsError) {
      console.error("Erro ao deletar records:", recordsError)
    }

    // 2. Deletar histórico de ranking
    const { error: historyError } = await supabase
      .from('ranking_history')
      .delete()
      .eq('strava_id', stravaId)

    if (historyError) {
      console.error("Erro ao deletar ranking_history:", historyError)
    }

    // 3. Deletar perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('strava_id', stravaId)

    if (profileError) {
      return NextResponse.json(
        { error: "Erro ao deletar perfil: " + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Conta encerrada com sucesso" 
    })
  } catch (error) {
    console.error("Erro ao encerrar conta:", error)
    return NextResponse.json(
      { error: "Erro ao encerrar conta" },
      { status: 500 }
    )
  }
}
