/**
 * Página de Ranking
 * Issue #9: Ranking com filtros por distância e gênero
 */

import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { DistanceType, Gender } from "@/types/database"

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

interface PageProps {
  searchParams: Promise<{ distance?: string; gender?: string }>
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
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum recorde encontrado para esta categoria.</p>
        <p className="text-sm mt-2">Seja o primeiro a sincronizar!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
            <th className="pb-3 pl-4">#</th>
            <th className="pb-3">Atleta</th>
            <th className="pb-3 text-right">Tempo</th>
            <th className="pb-3 text-right pr-4 hidden sm:table-cell">Data</th>
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
                  isCurrentUser
                    ? "bg-orange-500/10"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <td className="py-4 pl-4">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      isKing
                        ? "bg-yellow-500 text-black"
                        : position <= 3
                          ? "bg-gray-700 text-white"
                          : "text-gray-400"
                    }`}
                  >
                    {isKing ? "👑" : position}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {entry.avatar_url ? (
                      <Image
                        src={entry.avatar_url}
                        alt={entry.full_name || "Avatar"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          {entry.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${isCurrentUser ? "text-orange-400" : "text-white"}`}>
                        {entry.full_name || entry.username || "Atleta"}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-orange-400">(você)</span>
                        )}
                      </p>
                      {entry.sex && (
                        <span className="text-xs text-gray-500">
                          {entry.sex === "M" ? "♂" : "♀"}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <span className={`font-mono text-lg ${isKing ? "text-yellow-400 font-bold" : "text-white"}`}>
                    {formatTime(entry.time_seconds)}
                  </span>
                </td>
                <td className="py-4 text-right pr-4 text-gray-500 text-sm hidden sm:table-cell">
                  {entry.achieved_at
                    ? new Date(entry.achieved_at).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default async function RankingPage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams
  
  const distance = (params.distance as DistanceType) || "5k"
  const gender = params.gender || "all"

  const distances: { key: DistanceType; label: string }[] = [
    { key: "5k", label: "5K" },
    { key: "10k", label: "10K" },
    { key: "21k", label: "21K" },
  ]

  const genders = [
    { key: "all", label: "Geral" },
    { key: "M", label: "Masculino" },
    { key: "F", label: "Feminino" },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-orange-500">Run</span>asty
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/ranking" className="text-orange-400 font-medium">
              Ranking
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🏆 Ranking</h1>
          <p className="text-gray-400">Veja quem são os reis da montanha</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {/* Filtro de Distância */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {distances.map((d) => (
              <Link
                key={d.key}
                href={`/ranking?distance=${d.key}&gender=${gender}`}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  distance === d.key
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </div>

          {/* Filtro de Gênero */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {genders.map((g) => (
              <Link
                key={g.key}
                href={`/ranking?distance=${distance}&gender=${g.key}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  gender === g.key
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {g.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabela de Ranking */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <Suspense
            fallback={
              <div className="py-12 text-center text-gray-500">
                Carregando ranking...
              </div>
            }
          >
            <RankingTable
              distance={distance}
              gender={gender}
              currentUserStravaId={session?.user?.stravaId ?? null}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
