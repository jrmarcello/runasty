import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { DistanceType, Gender } from "@/types/database"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProfileInsights } from "@/components/profile/profile-insights"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { user } = session
  const supabase = await createClient()

  // Buscar perfil do usuário
  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("strava_id, full_name, username, avatar_url, sex, created_at, last_sync_at")
    .eq("strava_id", user.stravaId)
    .single()

  type ProfileRow = {
    strava_id: number
    full_name: string | null
    username: string | null
    avatar_url: string | null
    sex: Gender
    created_at: string
    last_sync_at: string | null
  }

  const profile = rawProfile as ProfileRow | null

  // Buscar recordes do usuário
  const { data: userRecords } = await supabase
    .from("records")
    .select("distance_type, time_seconds, achieved_at, strava_activity_id")
    .eq("strava_id", user.stravaId)

  // Buscar TODOS os recordes para calcular percentil
  const { data: allRecords } = await supabase
    .from("records")
    .select("strava_id, distance_type, time_seconds")
    .order("time_seconds", { ascending: true })

  // Buscar histórico de liderança do usuário
  const { data: leadershipHistory } = await supabase
    .from("ranking_history")
    .select("distance_type, started_at, ended_at, record_time_seconds")
    .eq("strava_id", user.stravaId)
    .order("started_at", { ascending: false })

  // Calcular estatísticas por distância
  type RecordData = {
    distance_type: DistanceType
    time_seconds: number
    achieved_at: string | null
    strava_activity_id: number | null
  }

  type AllRecordData = {
    strava_id: number
    distance_type: DistanceType
    time_seconds: number
  }

  type LeadershipData = {
    distance_type: DistanceType
    started_at: string
    ended_at: string | null
    record_time_seconds: number
  }

  const distances: DistanceType[] = ["5k", "10k", "21k"]
  
  const stats = distances.map((distance) => {
    // Tempo do usuário nesta distância
    const userRecord = (userRecords as RecordData[] | null)?.find(
      (r) => r.distance_type === distance
    )

    // Todos os tempos nesta distância (ordenados do menor para maior)
    const distanceRecords = (allRecords as AllRecordData[] | null)
      ?.filter((r) => r.distance_type === distance)
      .sort((a, b) => a.time_seconds - b.time_seconds) || []

    // Posição do usuário (1-indexed)
    const position = userRecord
      ? distanceRecords.findIndex((r) => r.strava_id === user.stravaId) + 1
      : null

    // Total de atletas nesta distância
    const totalAthletes = distanceRecords.length

    // Percentil (quanto % dos atletas você é mais rápido)
    // Se você está em 1º de 100, você é mais rápido que 99%
    const percentile = position && totalAthletes > 0
      ? Math.round(((totalAthletes - position) / totalAthletes) * 100)
      : null

    // Histórico de liderança nesta distância
    const leaderHistory = (leadershipHistory as LeadershipData[] | null)?.filter(
      (l) => l.distance_type === distance
    ) || []

    // Dias como líder (total)
    let totalLeaderDays = 0
    for (const reign of leaderHistory) {
      const start = new Date(reign.started_at)
      const end = reign.ended_at ? new Date(reign.ended_at) : new Date()
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      totalLeaderDays += days
    }

    // É líder atual?
    const isCurrentLeader = leaderHistory.some((l) => l.ended_at === null)

    return {
      distance,
      time: userRecord?.time_seconds || null,
      achievedAt: userRecord?.achieved_at || null,
      activityId: userRecord?.strava_activity_id || null,
      position,
      totalAthletes,
      percentile,
      totalLeaderDays,
      isCurrentLeader,
      reignCount: leaderHistory.length,
    }
  })

  // Dados do perfil formatados
  const formattedProfile = profile ? {
    stravaId: profile.strava_id,
    fullName: profile.full_name,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    sex: profile.sex,
    createdAt: profile.created_at,
    lastSyncAt: profile.last_sync_at,
  } : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Header user={{ name: user.name, image: user.image }} />

      <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6">
        {formattedProfile && (
          <ProfileInsights 
            profile={formattedProfile}
            stats={stats}
          />
        )}

        <Footer />
      </div>
    </main>
  )
}
