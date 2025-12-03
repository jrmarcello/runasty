"use client"

import { useState } from "react"
import { 
  Trophy, 
  TrendingUp, 
  Crown, 
  Activity,
  Calendar,
  Target,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { ViewOnStravaLink } from "@/components/auth/login-button"
import type { DistanceType, Gender } from "@/types/database"
import Link from "next/link"

interface ProfileData {
  stravaId: number
  fullName: string | null
  username: string | null
  avatarUrl: string | null
  sex: Gender
  createdAt: string
  lastSyncAt: string | null
}

interface DistanceStats {
  distance: DistanceType
  time: number | null
  achievedAt: string | null
  activityId: number | null
  position: number | null
  totalAthletes: number
  percentile: number | null
  totalLeaderDays: number
  isCurrentLeader: boolean
  reignCount: number
}

interface ProfileInsightsProps {
  profile: ProfileData
  stats: DistanceStats[]
}

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

// Formata data
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Calcula tempo relativo
function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "hoje"
  if (diffDays === 1) return "ontem"
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`
  return `há ${Math.floor(diffDays / 365)} anos`
}

// Labels das distâncias
const distanceLabels: Record<DistanceType, string> = {
  "5k": "5K",
  "10k": "10K",
  "21k": "Meia Maratona",
}

// Cor do percentil
function getPercentileColor(percentile: number): string {
  if (percentile >= 90) return "text-yellow-500"
  if (percentile >= 75) return "text-orange-500"
  if (percentile >= 50) return "text-blue-500"
  return "text-gray-500"
}

// Mensagem do percentil
function getPercentileMessage(percentile: number): string {
  if (percentile >= 95) return "Elite! 🏆"
  if (percentile >= 90) return "Top 10%! 🔥"
  if (percentile >= 75) return "Acima da média! 💪"
  if (percentile >= 50) return "Na média"
  if (percentile >= 25) return "Continue treinando!"
  return "Todo mundo começa de algum lugar!"
}

export function ProfileInsights({ profile, stats }: ProfileInsightsProps) {
  const [expandedDistance, setExpandedDistance] = useState<DistanceType | null>(null)

  // Estatísticas gerais
  const totalRecords = stats.filter((s) => s.time !== null).length
  const totalLeaderDays = stats.reduce((acc, s) => acc + s.totalLeaderDays, 0)
  const currentLeaderCount = stats.filter((s) => s.isCurrentLeader).length
  const bestPercentile = Math.max(...stats.map((s) => s.percentile || 0))

  // Membro desde
  const memberDays = Math.floor(
    (new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-4">
      {/* Header do Perfil */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatarUrl}
            name={profile.fullName || profile.username || "User"}
            size={64}
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.fullName || profile.username || "Atleta"}
            </h1>
            {profile.username && profile.fullName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{profile.username}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              <Calendar size={12} className="inline mr-1" />
              Membro há {memberDays} dias
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            ← Ranking
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Trophy size={20} className="mx-auto mb-1 text-orange-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalRecords}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Recordes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Crown size={20} className="mx-auto mb-1 text-yellow-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentLeaderCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Lideranças</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Activity size={20} className="mx-auto mb-1 text-blue-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeaderDays}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Dias no topo</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <TrendingUp size={20} className="mx-auto mb-1 text-green-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {bestPercentile > 0 ? `${bestPercentile}%` : "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Melhor %</div>
        </div>
      </div>

      {/* Detalhes por Distância */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target size={18} />
          Seus Recordes
        </h2>

        {stats.map((stat) => {
          const isExpanded = expandedDistance === stat.distance

          return (
            <div
              key={stat.distance}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header do Card */}
              <button
                onClick={() => setExpandedDistance(isExpanded ? null : stat.distance)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Distância */}
                <div className="w-16 text-center">
                  <div className="text-lg font-bold text-orange-500">
                    {distanceLabels[stat.distance].replace(" Maratona", "")}
                  </div>
                  {stat.distance === "21k" && (
                    <div className="text-[10px] text-gray-400">Meia</div>
                  )}
                </div>

                {/* Tempo e Posição */}
                <div className="flex-1 text-left">
                  {stat.time ? (
                    <>
                      <div className="text-xl font-mono font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {formatTime(stat.time)}
                        {stat.isCurrentLeader && (
                          <Crown size={16} className="text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.position}º de {stat.totalAthletes} atletas
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500">
                      Sem tempo registrado
                    </div>
                  )}
                </div>

                {/* Percentil */}
                {stat.percentile !== null && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPercentileColor(stat.percentile)}`}>
                      Top {100 - stat.percentile}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Mais rápido que {stat.percentile}%
                    </div>
                  </div>
                )}

                {/* Chevron */}
                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Detalhes Expandidos */}
              {isExpanded && stat.time && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Data do Recorde */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Conquistado em</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {stat.achievedAt ? formatDate(stat.achievedAt) : "-"}
                      </div>
                      {stat.achievedAt && (
                        <div className="text-xs text-gray-400">
                          {timeAgo(stat.achievedAt)}
                        </div>
                      )}
                    </div>

                    {/* Histórico de Liderança */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Liderança</div>
                      {stat.reignCount > 0 ? (
                        <>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {stat.reignCount}x no topo
                          </div>
                          <div className="text-xs text-gray-400">
                            {stat.totalLeaderDays} dias total
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">Nunca liderou</div>
                      )}
                    </div>
                  </div>

                  {/* Link para Strava */}
                  {stat.activityId && (
                    <div className="mt-4 flex justify-center">
                      <ViewOnStravaLink activityId={stat.activityId} />
                    </div>
                  )}

                  {/* Barra de Percentil Visual */}
                  {stat.percentile !== null && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Mais lento</span>
                        <span>{getPercentileMessage(stat.percentile)}</span>
                        <span>Mais rápido</span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${stat.percentile}%` }}
                        />
                      </div>
                      <div 
                        className="relative"
                        style={{ marginLeft: `calc(${stat.percentile}% - 8px)` }}
                      >
                        <div className="absolute -top-1 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-full shadow" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dica */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
        <p className="text-sm text-orange-700 dark:text-orange-300">
          💡 Seus recordes são sincronizados automaticamente quando você registra novas atividades no Strava!
        </p>
      </div>
    </div>
  )
}
