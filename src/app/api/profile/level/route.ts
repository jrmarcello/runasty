import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RankingPosition {
  distance: "5k" | "10k" | "21k"
  position: number
  isLeader: boolean
}

interface LevelResult {
  level: string
  emoji: string
  description: string
  bestPosition: RankingPosition | null
}

// Calcula o nível do usuário baseado em suas posições no ranking
export async function GET() {
  const session = await auth()

  if (!session?.user?.stravaId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const stravaId = session.user.stravaId

    // Buscar posição do usuário em cada distância
    const distances: ("5k" | "10k" | "21k")[] = ["5k", "10k", "21k"]
    const positions: RankingPosition[] = []

    for (const distance of distances) {
      // Buscar todos os records dessa distância ordenados por tempo
      const { data: records } = await supabase
        .from("records")
        .select("strava_id, time_seconds")
        .eq("distance_type", distance)
        .order("time_seconds", { ascending: true })

      if (records && records.length > 0) {
        // Encontrar posição do usuário
        const userIndex = (records as { strava_id: number; time_seconds: number }[])
          .findIndex(r => r.strava_id === stravaId)
        
        if (userIndex !== -1) {
          positions.push({
            distance,
            position: userIndex + 1,
            isLeader: userIndex === 0,
          })
        }
      }
    }

    // Determinar nível baseado na melhor posição
    const result = calculateLevel(positions)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao calcular nível:", error)
    return NextResponse.json(
      { error: "Erro ao calcular nível" },
      { status: 500 }
    )
  }
}

function calculateLevel(positions: RankingPosition[]): LevelResult {
  if (positions.length === 0) {
    return {
      level: "Novo por aqui",
      emoji: "🆕",
      description: "Faça sua primeira corrida!",
      bestPosition: null,
    }
  }

  // Encontrar melhor posição
  const bestPosition = positions.reduce((best, current) => 
    current.position < best.position ? current : best
  )

  const distanceLabel = bestPosition.distance.toUpperCase()

  // Verificar se é líder de alguma distância
  const leaderOf = positions.find(p => p.isLeader)
  if (leaderOf) {
    return {
      level: `Rei do ${leaderOf.distance.toUpperCase()}`,
      emoji: "👑",
      description: `Líder do ranking ${leaderOf.distance.toUpperCase()}`,
      bestPosition: leaderOf,
    }
  }

  // Formato: "Top X no 5K"
  return {
    level: `Top ${bestPosition.position} no ${distanceLabel}`,
    emoji: bestPosition.position <= 3 ? "🏆" : 
           bestPosition.position <= 10 ? "⚡" : 
           bestPosition.position <= 20 ? "🔥" : 
           bestPosition.position <= 50 ? "💪" : "🏃",
    description: `Posição #${bestPosition.position} no ${distanceLabel}`,
    bestPosition,
  }
}
