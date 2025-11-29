/**
 * Serviço de Sincronização com Strava
 * Issue #5: Buscar e processar dados do Strava
 * 
 * Estratégia de Otimização:
 * - Sync incremental: só busca atividades desde a última sync
 * - Filtragem inteligente: só busca detalhes de corridas com PRs
 * - Rate limiting flexível: 15min para manual, sem limite para auto
 * - Sync automático: no login e a cada hora
 */

import { createClient } from "@/lib/supabase/server"
import {
  getActivitiesAfter,
  getActivityDetails,
  STRAVA_EFFORT_NAMES,
  type StravaActivity,
} from "./client"
import type { DistanceType, RecordInsert } from "@/types/database"

// Cooldowns em minutos
const MANUAL_SYNC_COOLDOWN_MINUTES = 15
const AUTO_SYNC_COOLDOWN_MINUTES = 60

interface SyncResult {
  success: boolean
  message: string
  records?: {
    distance: DistanceType
    time_seconds: number
    achieved_at: string | null
    activity_id: number | null
  }[]
  error?: string
  apiCalls?: number // Para debug/monitoramento
  skipped?: boolean // Se pulou por cooldown
}

interface SyncOptions {
  /** Se true, é sync automático (cooldown mais longo, menos agressivo) */
  isAutoSync?: boolean
  /** Se true, força sync ignorando cooldown (usar com cuidado) */
  force?: boolean
}

/**
 * Busca os melhores tempos do usuário no Strava e salva no banco
 * Otimizado para poupar rate limits da API do Strava
 */
export async function syncUserRecords(
  stravaId: number,
  accessToken: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const { isAutoSync = false, force = false } = options
  let apiCalls = 0

  try {
    const supabase = await createClient()

    // Verificar última sincronização (rate limiting)
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_sync_at")
      .eq("strava_id", stravaId)
      .single()

    const profileData = profile as { last_sync_at: string | null } | null
    const lastSyncDate = profileData?.last_sync_at 
      ? new Date(profileData.last_sync_at) 
      : null

    // Cooldown diferente para sync manual vs automático
    const cooldownMinutes = isAutoSync 
      ? AUTO_SYNC_COOLDOWN_MINUTES 
      : MANUAL_SYNC_COOLDOWN_MINUTES

    if (!force && lastSyncDate) {
      const now = new Date()
      const minutesSinceLastSync =
        (now.getTime() - lastSyncDate.getTime()) / (1000 * 60)

      if (minutesSinceLastSync < cooldownMinutes) {
        const waitMinutes = Math.ceil(cooldownMinutes - minutesSinceLastSync)
        return {
          success: false,
          message: isAutoSync 
            ? `Sync automático: aguardando ${waitMinutes} minutos`
            : `Aguarde ${waitMinutes} minutos para sincronizar novamente`,
          skipped: true,
          apiCalls: 0,
        }
      }
    }

    // OTIMIZAÇÃO 1: Sync incremental - só buscar atividades desde última sync
    // Se nunca sincronizou, buscar últimos 30 dias
    const afterTimestamp = lastSyncDate 
      ? Math.floor(lastSyncDate.getTime() / 1000)
      : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)

    // Buscar atividades desde a última sync (máximo 50 por página)
    const activities = await getActivitiesAfter(accessToken, afterTimestamp, 50)
    apiCalls++

    // Filtrar apenas corridas
    const runs = activities.filter(
      (a: StravaActivity) => a.type === "Run" || a.sport_type === "Run"
    )

    // OTIMIZAÇÃO 2: Só buscar detalhes de corridas que podem ter PRs
    // Atividades com achievement_count > 0 ou pr_count > 0 têm mais chance de ter best_efforts
    const runsWithPotentialPRs = runs.filter(
      (run: StravaActivity) => run.achievement_count > 0 || run.pr_count > 0 || 
               // Também incluir corridas longas que podem ter best efforts
               run.distance >= 5000
    )

    // Mapa para guardar os melhores tempos encontrados
    const bestEfforts: Map<
      DistanceType,
      { time: number; date: string; activityId: number }
    > = new Map()

    // Primeiro, buscar tempos atuais do banco para comparar
    const { data: currentRecords } = await supabase
      .from("records")
      .select("distance_type, time_seconds")
      .eq("strava_id", stravaId)

    const currentTimes = new Map<DistanceType, number>()
    if (currentRecords) {
      for (const rec of currentRecords as { distance_type: DistanceType; time_seconds: number }[]) {
        currentTimes.set(rec.distance_type, rec.time_seconds)
      }
    }

    // OTIMIZAÇÃO 3: Limitar chamadas baseado no tipo de sync
    const maxDetailCalls = isAutoSync ? 5 : 10
    let detailCallsMade = 0

    // Para cada corrida com potencial de PR, buscar os best_efforts
    for (const run of runsWithPotentialPRs) {
      if (detailCallsMade >= maxDetailCalls) break

      try {
        const details = await getActivityDetails(accessToken, run.id)
        apiCalls++
        detailCallsMade++

        if (details.best_efforts) {
          for (const effort of details.best_efforts) {
            const distance = mapEffortToDistance(effort.name)
            
            if (distance) {
              const currentTime = currentTimes.get(distance)
              const currentBest = bestEfforts.get(distance)
              
              // Só considerar se for melhor que o tempo atual ou o melhor desta sync
              const isBetterThanDB = !currentTime || effort.elapsed_time < currentTime
              const isBetterThanCurrent = !currentBest || effort.elapsed_time < currentBest.time

              if (isBetterThanDB && isBetterThanCurrent) {
                bestEfforts.set(distance, {
                  time: effort.elapsed_time,
                  date: effort.start_date,
                  activityId: run.id,
                })
              }
            }
          }
        }
      } catch (err) {
        // Ignorar erros em atividades individuais
        console.warn(`Erro ao buscar detalhes da atividade ${run.id}:`, err)
      }
    }

    // Salvar recordes no banco
    const recordsToSave: RecordInsert[] = []
    const savedRecords: SyncResult["records"] = []

    for (const [distance, data] of bestEfforts) {
      recordsToSave.push({
        strava_id: stravaId,
        distance_type: distance,
        time_seconds: data.time,
        achieved_at: data.date,
        strava_activity_id: data.activityId,
      })

      savedRecords.push({
        distance,
        time_seconds: data.time,
        achieved_at: data.date,
        activity_id: data.activityId,
      })
    }

    if (recordsToSave.length > 0) {
      // Upsert: atualizar se existir, criar se não
      for (const record of recordsToSave) {
        await supabase.from("records").upsert(record as never, {
          onConflict: "strava_id,distance_type",
        })
        
        // Verificar se este tempo faz o usuário virar "Rei da Montanha"
        await checkAndUpdateKing(
          supabase,
          stravaId,
          record.distance_type,
          record.time_seconds
        )
      }
    }

    // Atualizar última sincronização
    await supabase
      .from("profiles")
      .update({ last_sync_at: new Date().toISOString() } as never)
      .eq("strava_id", stravaId)

    // Montar mensagem informativa
    const activitiesChecked = runsWithPotentialPRs.length
    const newRecordsCount = savedRecords.length
    
    let message = ""
    if (activities.length === 0) {
      message = "Nenhuma atividade nova desde a última sincronização."
    } else if (newRecordsCount === 0) {
      message = `${activitiesChecked} corridas analisadas, nenhum novo recorde.`
    } else {
      message = `${newRecordsCount} recorde(s) atualizado(s)!`
    }

    return {
      success: true,
      message,
      records: savedRecords,
      apiCalls,
    }
  } catch (error) {
    console.error("Erro na sincronização:", error)
    return {
      success: false,
      message: "Erro ao sincronizar com Strava",
      error: error instanceof Error ? error.message : "Erro desconhecido",
      apiCalls,
    }
  }
}

/**
 * Mapeia o nome do esforço do Strava para nosso tipo de distância
 */
function mapEffortToDistance(effortName: string): DistanceType | null {
  if (effortName === STRAVA_EFFORT_NAMES["5k"]) return "5k"
  if (effortName === STRAVA_EFFORT_NAMES["10k"]) return "10k"
  if (effortName === STRAVA_EFFORT_NAMES["21k"]) return "21k"
  return null
}

/**
 * Verifica se o usuário se tornou o "Rei da Montanha" para uma distância
 * Se sim, atualiza a tabela ranking_history
 */
async function checkAndUpdateKing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stravaId: number,
  distanceType: DistanceType,
  timeSeconds: number
): Promise<void> {
  try {
    // Buscar o líder atual desta distância (ranking geral, sem filtro de gênero)
    const { data } = await supabase
      .from("ranking_history")
      .select("id, strava_id, record_time_seconds")
      .eq("distance_type", distanceType)
      .is("gender_filter", null)
      .is("ended_at", null)
      .single()

    const currentKing = data as { 
      id: string
      strava_id: number
      record_time_seconds: number 
    } | null

    // Se não há líder atual ou o novo tempo é melhor
    if (!currentKing || timeSeconds < currentKing.record_time_seconds) {
      // Se há um líder atual e não é o mesmo usuário, fechar seu reinado
      if (currentKing && currentKing.strava_id !== stravaId) {
        await supabase
          .from("ranking_history")
          .update({ ended_at: new Date().toISOString() } as never)
          .eq("id", currentKing.id)
      }

      // Se o novo rei é diferente do atual (ou não há rei), criar novo registro
      if (!currentKing || currentKing.strava_id !== stravaId) {
        await supabase.from("ranking_history").insert({
          strava_id: stravaId,
          distance_type: distanceType,
          gender_filter: null, // Ranking geral
          record_time_seconds: timeSeconds,
        } as never)
      } else if (currentKing && currentKing.strava_id === stravaId) {
        // Mesmo rei, mas tempo melhorou - atualizar o tempo
        await supabase
          .from("ranking_history")
          .update({ record_time_seconds: timeSeconds } as never)
          .eq("id", currentKing.id)
      }
    }
  } catch (error) {
    // Log mas não falha a sincronização
    console.error("Erro ao atualizar rei da montanha:", error)
  }
}
