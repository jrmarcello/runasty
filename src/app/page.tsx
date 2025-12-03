import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DistanceType, Gender } from "@/types/database"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RankingClient, type RankingEntry } from "@/components/ranking/ranking-client"
import { ConsentWrapper } from "@/components/auth/consent-wrapper"

// Força renderização dinâmica (sem cache) para sempre buscar dados atualizados
export const dynamic = "force-dynamic"

export default async function Home() {
  const session = await auth()

  // Se não estiver logado, redireciona para login
  if (!session?.user) {
    redirect("/login")
  }

  const { user } = session
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Verificar consentimento do usuário atual
  const { data: userProfile } = await supabaseAdmin
    .from("profiles")
    .select("consent_public_ranking")
    .eq("strava_id", user.stravaId)
    .single()

  const hasConsent = (userProfile as { consent_public_ranking?: boolean } | null)?.consent_public_ranking ?? null

  // Buscar TODOS os records de uma vez (todas as distâncias)
  // FILTRO IMPORTANTE: Apenas usuários que consentiram aparecem no ranking público
  const { data: rawData } = await supabase
    .from("records")
    .select(`
      strava_id,
      distance_type,
      time_seconds,
      achieved_at,
      profiles!inner (
        full_name,
        username,
        avatar_url,
        sex,
        consent_public_ranking
      )
    `)
    .order("time_seconds", { ascending: true })

  // Buscar histórico de liderança para todas as distâncias
  const { data: leadershipData } = await supabase
    .from("ranking_history")
    .select("strava_id, distance_type, started_at")
    .is("ended_at", null)

  // Criar mapa de liderança: distance_type -> strava_id -> started_at
  const leadershipMap = new Map<string, Map<number, string>>()
  if (leadershipData) {
    for (const entry of leadershipData as { strava_id: number; distance_type: string; started_at: string }[]) {
      if (!leadershipMap.has(entry.distance_type)) {
        leadershipMap.set(entry.distance_type, new Map())
      }
      leadershipMap.get(entry.distance_type)!.set(entry.strava_id, entry.started_at)
    }
  }

  // Processar records - FILTRAR apenas quem tem consentimento
  type RawRecord = {
    strava_id: number
    distance_type: DistanceType
    time_seconds: number
    achieved_at: string | null
    profiles: {
      full_name: string | null
      username: string | null
      avatar_url: string | null
      sex: Gender
      consent_public_ranking: boolean | null
    }
  }

  const allRecords: RankingEntry[] = rawData
    ? (rawData as unknown as RawRecord[])
        // Filtrar apenas usuários com consentimento explícito
        .filter((record) => record.profiles.consent_public_ranking === true)
        .map((record) => ({
          strava_id: record.strava_id,
          distance_type: record.distance_type,
          time_seconds: record.time_seconds,
          achieved_at: record.achieved_at,
          full_name: record.profiles.full_name,
          username: record.profiles.username,
          avatar_url: record.profiles.avatar_url,
          sex: record.profiles.sex,
          leadership_started_at:
            leadershipMap.get(record.distance_type)?.get(record.strava_id) || record.achieved_at,
        }))
    : []

  // Buscar records do usuário atual
  const { data: userRecordsData } = await supabase
    .from("records")
    .select("distance_type, time_seconds, achieved_at")
    .eq("strava_id", user.stravaId)

  // Criar objeto de records do usuário (Map não serializa para client)
  type RecordRow = { distance_type: string; time_seconds: number; achieved_at: string | null }
  const userRecords: Record<DistanceType, { time: number; date: string | null }> = {} as Record<DistanceType, { time: number; date: string | null }>
  if (userRecordsData) {
    for (const record of userRecordsData as RecordRow[]) {
      userRecords[record.distance_type as DistanceType] = {
        time: record.time_seconds,
        date: record.achieved_at,
      }
    }
  }

  return (
    <ConsentWrapper userName={user.name ?? null} initialHasConsent={hasConsent}>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
        <Header user={{ name: user.name, image: user.image }} />

        <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6">
          <RankingClient
            allRecords={allRecords}
            currentUserStravaId={user.stravaId ?? null}
            userRecords={userRecords}
          />

          {/* Footer com links */}
          <Footer />
        </div>
      </main>
    </ConsentWrapper>
  )
}
