"use client"

import { useState } from "react"
import { Activity, Crown, Timer } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
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

export interface RankingEntry {
  strava_id: number
  distance_type: DistanceType
  time_seconds: number
  achieved_at: string | null
  full_name: string | null
  username: string | null
  avatar_url: string | null
  sex: Gender
  leadership_started_at?: string | null
}

interface RankingClientProps {
  allRecords: RankingEntry[]
  currentUserStravaId: number | null
  userRecords: Record<DistanceType, { time: number; date: string | null }> | Record<string, never>
}

const RANKING_LIMIT = 20

export function RankingClient({ allRecords, currentUserStravaId, userRecords }: RankingClientProps) {
  const [distance, setDistance] = useState<DistanceType>("5k")
  const [gender, setGender] = useState<"all" | "M" | "F">("all")

  const distances: { key: DistanceType; label: string }[] = [
    { key: "5k", label: "5K" },
    { key: "10k", label: "10K" },
    { key: "21k", label: "21K" },
  ]

  const genders: { key: "all" | "M" | "F"; label: string }[] = [
    { key: "all", label: "Geral" },
    { key: "M", label: "Masc" },
    { key: "F", label: "Fem" },
  ]

  // Filtrar records pela distância e gênero selecionados
  const filteredRankings = allRecords
    .filter((entry) => entry.distance_type === distance)
    .filter((entry) => {
      if (gender === "all") return true
      return entry.sex === gender
    })
    .sort((a, b) => a.time_seconds - b.time_seconds)

  // Encontrar posição do usuário atual
  const currentUserPosition = currentUserStravaId
    ? filteredRankings.findIndex((r) => r.strava_id === currentUserStravaId) + 1
    : 0
  const currentUserEntry = currentUserPosition > 0 ? filteredRankings[currentUserPosition - 1] : null
  const isUserOutsideLimit = currentUserPosition > RANKING_LIMIT

  // Limitar ranking ao top 20
  const limitedRankings = filteredRankings.slice(0, RANKING_LIMIT)

  // Separar pódio e resto
  const podium = limitedRankings.slice(0, 3)
  const rest = limitedRankings.slice(3)

  // Mensagem motivacional
  const userRecord = userRecords[distance]
  let motivationalMessage = "Sincronize para entrar na competição!"
  if (userRecord) {
    motivationalMessage = "Você está no jogo! Continue treinando."
  }

  return (
    <>
      {/* Meus Recordes - Compacto */}
      <div className="mb-5">
        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 text-center mb-2 uppercase tracking-wider font-medium">
          Meus Recordes
        </p>
        <div className="flex justify-center gap-3 sm:gap-4">
          {distances.map((d) => {
            const record = userRecords[d.key]
            return (
              <button
                key={d.key}
                onClick={() => setDistance(d.key)}
                className={`flex flex-col items-center p-2.5 sm:p-3 rounded-xl transition-all min-w-[70px] sm:min-w-[80px] ${
                  distance === d.key
                    ? "bg-orange-500 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`text-xs font-semibold ${distance === d.key ? "text-orange-100" : "text-gray-400 dark:text-gray-500"}`}>
                  {d.label}
                </span>
                <span className={`font-mono text-base sm:text-lg font-bold ${distance === d.key ? "text-white" : ""}`}>
                  {record ? formatTime(record.time) : "--:--"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mensagem motivacional */}
      <p className="text-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm mb-5">{motivationalMessage}</p>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-5">
        {/* Filtro de Distância */}
        <div className="flex bg-gray-200 dark:bg-gray-800 rounded-xl p-1 justify-center">
          {distances.map((d) => (
            <button
              key={d.key}
              onClick={() => setDistance(d.key)}
              className={`flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all text-center min-w-[60px] ${
                distance === d.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:bg-gray-300 dark:active:bg-gray-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Filtro de Gênero */}
        <div className="flex bg-gray-200 dark:bg-gray-800 rounded-xl p-1 justify-center">
          {genders.map((g) => (
            <button
              key={g.key}
              onClick={() => setGender(g.key)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center ${
                gender === g.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:bg-gray-300 dark:active:bg-gray-700"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Ranking */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {filteredRankings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum recorde encontrado.</p>
          </div>
        ) : (
          <div>
            {/* Pódio - Top 3 com destaque */}
            <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
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
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {rest.map((entry, index) => {
                  const position = index + 4
                  const isCurrentUser = entry.strava_id === currentUserStravaId

                  return (
                    <div
                      key={entry.strava_id}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                        isCurrentUser
                          ? "bg-orange-50 dark:bg-orange-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-700/50"
                      }`}
                    >
                      <span className="text-gray-400 dark:text-gray-500 text-sm font-medium w-6 text-center">
                        {position}
                      </span>
                      <Avatar src={entry.avatar_url} name={entry.full_name} size={32} />
                      <span
                        className={`flex-1 text-sm font-medium truncate ${
                          isCurrentUser ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {entry.full_name || entry.username || "Atleta"}
                        {isCurrentUser && <span className="text-xs font-normal ml-1 opacity-70">(você)</span>}
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {formatTime(entry.time_seconds)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Card do usuário quando estiver fora do top 20 */}
            {isUserOutsideLimit && currentUserEntry && (
              <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                {/* Indicador de posições omitidas */}
                <div className="flex items-center justify-center py-2 gap-2">
                  <span className="text-gray-400 dark:text-gray-500 text-xs">• • •</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">
                    +{currentUserPosition - RANKING_LIMIT - 1} posições
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">• • •</span>
                </div>

                {/* Card do usuário destacado */}
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-500/15 dark:to-orange-500/5 border-l-4 border-orange-500">
                  <span className="text-orange-500 text-sm font-bold w-6 text-center">{currentUserPosition}</span>
                  <Avatar src={currentUserEntry.avatar_url} name={currentUserEntry.full_name} size={32} />
                  <span className="flex-1 text-sm font-semibold truncate text-orange-600 dark:text-orange-400">
                    {currentUserEntry.full_name || currentUserEntry.username || "Atleta"}
                    <span className="text-xs font-normal ml-1 opacity-70">(você)</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400">
                    {formatTime(currentUserEntry.time_seconds)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
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
    1: "h-40",
    2: "h-32",
    3: "h-32",
  }

  const widths = {
    1: "w-26 sm:w-32",
    2: "w-22 sm:w-28",
    3: "w-22 sm:w-28",
  }

  const bgColors = {
    1: "bg-yellow-500",
    2: "bg-gray-400",
    3: "bg-amber-600",
  }

  // Calcula dias de liderança
  const getDaysAsLeader = () => {
    if (!entry.leadership_started_at) return 0
    const start = new Date(entry.leadership_started_at)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysAsLeader = getDaysAsLeader()

  return (
    <div
      className={`flex flex-col items-center ${isKing ? "order-2" : position === 2 ? "order-1" : "order-3"}`}
    >
      {/* Coroa para o rei/rainha */}
      {isKing && <Crown size={28} className="text-yellow-400 mb-1 fill-yellow-400/30" />}

      {/* Avatar */}
      <div className="mb-2">
        <Avatar
          src={entry.avatar_url}
          name={entry.full_name}
          size={isKing ? 68 : 52}
          className={`${isCurrentUser ? "ring-2 ring-orange-500" : ""} ${isKing ? "ring-3 ring-yellow-400" : ""}`}
        />
      </div>

      {/* Pedestal com infos dentro */}
      <div
        className={`${heights[position as 1 | 2 | 3]} ${widths[position as 1 | 2 | 3]} rounded-t-xl flex flex-col items-center justify-start pt-3 pb-2 gap-2 relative ${
          bgColors[position as 1 | 2 | 3]
        }`}
      >
        {/* Número da posição como badge */}
        <div className="bg-white/25 rounded-full w-8 h-8 flex items-center justify-center">
          <span className="text-white font-black text-lg">{position}</span>
        </div>

        {/* Nome - maior destaque */}
        <div className="text-center px-2 w-full leading-tight">
          <p className={`text-sm font-bold truncate ${isCurrentUser ? "text-white" : "text-white"}`}>
            {entry.full_name?.split(" ")[0] || "Atleta"}
          </p>
          {isCurrentUser && <span className="text-[10px] text-white/70 font-medium -mt-0.5 block">(você)</span>}
        </div>

        {/* Tags de tempo */}
        <div className="flex flex-col gap-1 mt-auto">
          {/* RP - Record Pessoal */}
          <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
            <Activity size={12} className="text-white" />
            <span className="font-mono text-xs font-semibold text-white">{formatTime(entry.time_seconds)}</span>
          </div>

          {/* Tempo de liderança */}
          {daysAsLeader > 0 && (
            <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
              <Timer size={12} className="text-white" />
              <span className="text-xs font-semibold text-white">{daysAsLeader}d líder</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
