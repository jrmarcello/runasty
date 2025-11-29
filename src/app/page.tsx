import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { DistanceType, Gender } from "@/types/database"
import { Header } from "@/components/layout/header"
import { MyRecords } from "@/components/ranking/my-records"
import { Avatar } from "@/components/ui/avatar"
import { LeadershipBadge } from "@/components/ranking/leadership-badge"

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
  leadership_started_at?: string | null
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

  // Buscar histórico de liderança para os top 3
  const { data: leadershipData } = await supabase
    .from("ranking_history")
    .select("strava_id, started_at")
    .eq("distance_type", distance)
    .is("ended_at", null)

  const leadershipMap = new Map<number, string>()
  if (leadershipData) {
    for (const entry of leadershipData as { strava_id: number; started_at: string }[]) {
      leadershipMap.set(entry.strava_id, entry.started_at)
    }
  }

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
        leadership_started_at: leadershipMap.get(record.strava_id) || record.achieved_at,
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

  // Separar pódio e resto
  const podium = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  return (
    <div>
      {/* Pódio - Top 3 com destaque */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-center items-end gap-2 sm:gap-4">
          {/* 2º lugar */}
          {podium[1] && (
            <PodiumCard
              entry={podium[1]}
              position={2}
              isCurrentUser={podium[1].strava_id === currentUserStravaId}
            />
          )}
          
          {/* 1º lugar - Maior */}
          {podium[0] && (
            <PodiumCard
              entry={podium[0]}
              position={1}
              isCurrentUser={podium[0].strava_id === currentUserStravaId}
              isKing
            />
          )}
          
          {/* 3º lugar */}
          {podium[2] && (
            <PodiumCard
              entry={podium[2]}
              position={3}
              isCurrentUser={podium[2].strava_id === currentUserStravaId}
            />
          )}
        </div>
      </div>

      {/* Resto da lista */}
      {rest.length > 0 && (
        <div className="divide-y divide-gray-800">
          {rest.map((entry, index) => {
            const position = index + 4
            const isCurrentUser = entry.strava_id === currentUserStravaId

            return (
              <div
                key={entry.strava_id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isCurrentUser ? "bg-orange-500/10" : "hover:bg-gray-800/50"
                }`}
              >
                <span className="text-gray-500 text-sm w-6 text-center">{position}</span>
                <Avatar src={entry.avatar_url} name={entry.full_name} size={28} />
                <span
                  className={`flex-1 text-sm truncate ${isCurrentUser ? "text-orange-400" : "text-white"}`}
                >
                  {entry.full_name || entry.username || "Atleta"}
                  {isCurrentUser && <span className="text-xs ml-1">(você)</span>}
                </span>
                <span className="font-mono text-sm text-gray-300">
                  {formatTime(entry.time_seconds)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PodiumCard({
  entry,
  position,
  isCurrentUser,
  isKing = false,
}: {
  entry: RankingEntry
  position: number
  isCurrentUser: boolean
  isKing?: boolean
}) {
  const heights = {
    1: "h-32",
    2: "h-24",
    3: "h-20",
  }

  const medals = {
    1: "👑",
    2: "🥈",
    3: "🥉",
  }

  return (
    <div
      className={`flex flex-col items-center ${
        isKing ? "order-2" : position === 2 ? "order-1" : "order-3"
      }`}
    >
      {/* Avatar e info */}
      <div className="text-center mb-2">
        <div className="relative">
          <Avatar
            src={entry.avatar_url}
            name={entry.full_name}
            size={isKing ? 56 : 44}
            className={isCurrentUser ? "ring-2 ring-orange-500" : ""}
          />
          <span className="absolute -bottom-1 -right-1 text-lg">
            {medals[position as 1 | 2 | 3]}
          </span>
        </div>
        <p
          className={`text-xs mt-1 truncate max-w-[80px] ${
            isCurrentUser ? "text-orange-400 font-medium" : "text-gray-300"
          }`}
        >
          {entry.full_name?.split(" ")[0] || "Atleta"}
        </p>
        <p className={`font-mono text-sm font-bold ${isKing ? "text-yellow-400" : "text-white"}`}>
          {formatTime(entry.time_seconds)}
        </p>
        {/* Badge de tempo no topo */}
        {entry.leadership_started_at && (
          <div className="mt-1">
            <LeadershipBadge startedAt={entry.leadership_started_at} isKing={isKing} />
          </div>
        )}
      </div>

      {/* Pedestal */}
      <div
        className={`${heights[position as 1 | 2 | 3]} w-16 sm:w-20 rounded-t-lg flex items-end justify-center pb-2 ${
          isKing
            ? "bg-gradient-to-t from-yellow-600 to-yellow-500"
            : position === 2
              ? "bg-gradient-to-t from-gray-500 to-gray-400"
              : "bg-gradient-to-t from-amber-700 to-amber-600"
        }`}
      >
        <span className="text-white font-bold text-xl">{position}</span>
      </div>
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
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-yellow-500 text-xl">👑</span>
            <span className="text-white font-medium">{leader.name}</span>
            <LeadershipBadge startedAt={leader.startedAt} />
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
