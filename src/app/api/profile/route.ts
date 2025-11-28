import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// API para verificar o perfil do usuário no Supabase
// GET /api/profile
export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('strava_id', session.user.stravaId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Remove tokens sensíveis da resposta
    const safeProfile = {
      ...profile,
      strava_access_token: profile.strava_access_token ? "***" : null,
      strava_refresh_token: profile.strava_refresh_token ? "***" : null,
    }

    return NextResponse.json(safeProfile)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar perfil" }, 
      { status: 500 }
    )
  }
}
