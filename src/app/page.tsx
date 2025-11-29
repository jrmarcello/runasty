import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { DistanceType, Gender } from "@/types/database"
import { Header } from "@/components/layout/header"
import { MyRecords } from "@/components/ranking/my-records"
import { LeaderTime } from "@/components/ranking/leader-time"
import { Avatar } from "@/components/ui/avatar"

// Formata segundos para mm:ss ou hh:mm:ss
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

interface RankingEntry {
  strava_id: number
  time_seconds: number
  achieved_at: string | null
  full_name: string | null
  username: string | null
  avatar_url: string | null
  sex: Gender
}

// Busca o líder atual para uma distância
async function getCurrentLeader(distance: DistanceType) {
  const supabase = await createClient()

  // Primeiro tenta buscar do ranking_history
  const { data: historyData } = await supabase
    .from("ranking_history")
    .select(`
      strava_id,
      started_at,
      profiles (
        full_name,
        username
      )
    `)
    .eq("distance_type", distance)
    .is("ended_at", null)
    .limit(1)
    .single()

  if (historyData) {
    type LeaderData = {
      strava_id: number
      started_at: string
      profiles: {
        full_name: string | null
        username: string | null
      }
    }

    const leader = historyData as unknown as LeaderData

    return {
      stravaId: leader.strava_id,
      startedAt: leader.started_at,
      name: leader.profiles.full_name || leader.profiles.username || "Atleta",
    }
  }

  // Fallback: buscar o primeiro lugar dos records
  const { data: recordData } = await supabase
    .from("records")
    .select(`
      strava_id,
      achieved_at,
      profiles (
        full_name,
        username
      )
    `)
    .eq("distance_type", distance)
    .order("time_seconds", { ascending: true })
    .limit(1)
    .single()

  if (recordData) {
    type RecordData = {
      strava_id: number
      achieved_at: string | null
      profiles: {
        full_name: string | null
        username: string | null
      }
    }

    const record = recordData as unknown as RecordData

    return {
      stravaId: record.strava_id,
      startedAt: record.achieved_at || new Date().toISOString(),
      name: record.profiles.full_name || record.profiles.username || "Atleta",
    }
  }

  return null
}

async function RankingTable({
  distance,
  gender,
  currentUserStravaId,
}: {
  distance: DistanceType
  gender: string
  currentUserStravaId: number | null
}) {
  const supabase = await createClient()

  // Buscar ranking com JOIN
  const { data: rawData } = await supabase
    .from("records")
    .select(`
      strava_id,
      time_seconds,
      achieved_at,
      profiles!inner (
        full_name,
        username,
        avatar_url,
        sex
      )
    `)
    .eq("distance_type", distance)
    .order("time_seconds", { ascending: true })
    .limit(50)

  // Processar e filtrar por gênero
  let rankings: RankingEntry[] = []

  if (rawData) {
    type RawRecord = {
      strava_id: number
      time_seconds: number
      achieved_at: string | null
      profiles: {
        full_name: string | null
        username: string | null
        avatar_url: string | null
        sex: Gender
      }
    }

    rankings = (rawData as unknown as RawRecord[])
      .map((record) => ({
        strava_id: record.strava_id,
        time_seconds: record.time_seconds,
        achieved_at: record.achieved_at,
        full_name: record.profiles.full_name,
        username: record.profiles.username,
        avatar_url: record.profiles.avatar_url,
        sex: record.profiles.sex,
      }))
      .filter((entry) => {
        if (gender === "all") return true
        if (gender === "M") return entry.sex === "M"
        if (gender === "F") return entry.sex === "F"
        return true
      })
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum recorde encontrado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 text-xs border-b border-gray-700">
            <th className="pb-2 pl-2">#</th>
            <th className="pb-2">Atleta</th>
            <th className="pb-2 text-right pr-2">Tempo</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((entry, index) => {
            const isCurrentUser = entry.strava_id === currentUserStravaId
            const position = index + 1
            const isKing = position === 1

            return (
              <tr
                key={entry.strava_id}
                className={`border-b border-gray-800 ${
                  isCurrentUser ? "bg-orange-500/10" : "hover:bg-gray-800/50"
                }`}
              >
                <td className="py-3 pl-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isKing
                        ? "bg-yellow-500 text-black"
                        : position <= 3
                          ? "bg-gray-700 text-white"
                          : "text-gray-500"
                    }`}
                  >
                    {isKing ? "👑" : position}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={entry.avatar_url} name={entry.full_name} size={32} />
                    <div>
                      <p
                        className={`text-sm font-medium ${isCurrentUser ? "text-orange-400" : "text-white"}`}
                      >
                        {entry.full_name || entry.username || "Atleta"}
                        {isCurrentUser && <span className="ml-1 text-xs">(você)</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right pr-2">
                  <span
                    className={`font-mono text-sm ${isKing ? "text-yellow-400 font-bold" : "text-white"}`}
                  >
                    {formatTime(entry.time_seconds)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ distance?: string; gender?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const session = await auth()

  // Se não estiver logado, redireciona para login
  if (!session?.user) {
    redirect("/login")
  }

  const { user } = session
  const params = await searchParams

  const distance = (params.distance as DistanceType) || "5k"
  const gender = params.gender || "all"

  // Buscar records do usuário
  const supabase = await createClient()
  const { data: records } = await supabase
    .from("records")
    .select("distance_type, time_seconds, achieved_at")
    .eq("strava_id", user.stravaId)

  // Criar mapa de records por distância
  type RecordRow = { distance_type: string; time_seconds: number; achieved_at: string | null }
  const recordsMap = new Map<DistanceType, { time: number; date: string | null }>()
  if (records) {
    for (const record of records as RecordRow[]) {
      recordsMap.set(record.distance_type as DistanceType, {
        time: record.time_seconds,
        date: record.achieved_at,
      })
    }
  }

  // Buscar líder atual
  const leader = await getCurrentLeader(distance)

  const distances: { key: DistanceType; label: string }[] = [
    { key: "5k", label: "5K" },
    { key: "10k", label: "10K" },
    { key: "21k", label: "21K" },
  ]

  const genders = [
    { key: "all", label: "Geral" },
    { key: "M", label: "Masc" },
    { key: "F", label: "Fem" },
  ]

  // Mensagem motivacional
  const userRecord = recordsMap.get(distance)
  let motivationalMessage = "Sincronize para entrar na competição! 🏃"
  if (userRecord) {
    motivationalMessage = "Você está no jogo! Continue treinando 💪"
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header user={{ name: user.name, image: user.image }} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Meus Recordes - Compacto */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 text-center mb-2">Meus Recordes</p>
          <MyRecords records={recordsMap} />
        </div>

        {/* Mensagem motivacional */}
        <p className="text-center text-gray-400 text-sm mb-6">{motivationalMessage}</p>

        {/* Líder atual */}
        {leader && (
          <div className="mb-6">
            <LeaderTime startedAt={leader.startedAt} leaderName={leader.name} />
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          {/* Filtro de Distância */}
          <div className="flex bg-gray-800 rounded-lg p-1 justify-center">
            {distances.map((d) => (
              <a
                key={d.key}
                href={`/?distance=${d.key}&gender=${gender}`}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  distance === d.key
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {d.label}
              </a>
            ))}
          </div>

          {/* Filtro de Gênero */}
          <div className="flex bg-gray-800 rounded-lg p-1 justify-center">
            {genders.map((g) => (
              <a
                key={g.key}
                href={`/?distance=${distance}&gender=${g.key}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  gender === g.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {g.label}
              </a>
            ))}
          </div>
        </div>

        {/* Tabela de Ranking */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <Suspense
            fallback={<div className="py-8 text-center text-gray-500">Carregando...</div>}
          >
            <RankingTable
              distance={distance}
              gender={gender}
              currentUserStravaId={user.stravaId ?? null}
            />
          </Suspense>
        </div>

        {/* Footer discreto */}
        <p className="text-center text-xs text-gray-600 mt-8">
          Feito com ❤️ e 🏃
        </p>
      </div>
    </main>
  )
}
