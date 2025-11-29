/**
 * Serviço de Sincronização com Strava
 * Issue #5: Buscar e processar dados do Strava
 * 
 * Estratégia (com webhook ativo):
 * - Webhook recebe eventos do Strava e dispara sync automático
 * - Sync manual disponível via botão "Forçar Sincronização"
 * - Cooldown de 5 minutos para evitar spam de requests
 * - Primeiro login: busca histórico completo com paginação otimizada
 */

import { createClient } from "@/lib/supabase/server"
import {
  getActivitiesAfter,
  getActivityDetails,
  STRAVA_EFFORT_NAMES,
  type StravaActivity,
} from "./client"
import type { DistanceType, RecordInsert } from "@/types/database"

// Cooldown único de 5 minutos (proteção contra spam)
const SYNC_COOLDOWN_MINUTES = 5

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
  /** Se true, é sync via webhook (sem cooldown) */
  isAutoSync?: boolean
  /** Se true, força sync ignorando cooldown */
  force?: boolean
  /** Se true, busca atividades de 1 ano (sync completo inicial) */
  fullSync?: boolean
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
  const { isAutoSync = false, force = false, fullSync = false } = options
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

    // Webhook (isAutoSync) não tem cooldown, manual tem 5 min
    if (!force && !isAutoSync && lastSyncDate) {
      const now = new Date()
      const minutesSinceLastSync =
        (now.getTime() - lastSyncDate.getTime()) / (1000 * 60)

      if (minutesSinceLastSync < SYNC_COOLDOWN_MINUTES) {
        const waitMinutes = Math.ceil(SYNC_COOLDOWN_MINUTES - minutesSinceLastSync)
        return {
          success: false,
          message: `Aguarde ${waitMinutes} minuto${waitMinutes > 1 ? 's' : ''} para sincronizar novamente`,
          skipped: true,
          apiCalls: 0,
        }
      }
    }

    // Detectar se é primeiro sync (usuário nunca sincronizou)
    const isFirstSync = !lastSyncDate

    // Buscar atividades
    let runsWithPotentialPRs: StravaActivity[]

    if (isFirstSync) {
      // PRIMEIRO SYNC: Buscar últimos 90 dias para pegar PRs recentes
      console.log("🚀 Primeiro sync - buscando últimos 90 dias...")
      const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
      const activities = await getActivitiesAfter(accessToken, ninetyDaysAgo, 100)
      apiCalls++
      
      // Filtrar corridas com potencial de PR
      runsWithPotentialPRs = activities.filter(
        (a: StravaActivity) => 
          (a.type === "Run" || a.sport_type === "Run") &&
          (a.achievement_count > 0 || a.pr_count > 0 || a.distance >= 5000)
      )
      console.log(`📊 Encontradas ${runsWithPotentialPRs.length} corridas com potencial de PR`)
    } else {
      // SYNC INCREMENTAL: Buscar apenas desde última sync
      const afterTimestamp = fullSync
        ? Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000) // 1 ano
        : Math.floor(lastSyncDate.getTime() / 1000)

      const activities = await getActivitiesAfter(accessToken, afterTimestamp, 50)
      apiCalls++

      // Filtrar apenas corridas com potencial de PR
      runsWithPotentialPRs = activities.filter(
        (a: StravaActivity) => 
          (a.type === "Run" || a.sport_type === "Run") &&
          (a.achievement_count > 0 || a.pr_count > 0 || a.distance >= 5000)
      )
    }

    // Ordenar por pr_count (corridas com mais PRs primeiro)
    // Isso garante que pegamos os melhores tempos mesmo com limite de chamadas
    runsWithPotentialPRs.sort((a, b) => (b.pr_count || 0) - (a.pr_count || 0))

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

    // OTIMIZAÇÃO 3: Limitar chamadas de detalhes baseado no tipo de sync
    // Rate limit do Strava: 100 requests/15min, 1000/dia
    // Primeiro sync: até 15 chamadas (pegar os PRs mais recentes)
    // Auto sync (webhook): limitar a 3 chamadas
    // Manual sync: limitar a 10 chamadas
    const maxDetailCalls = isFirstSync ? 15 : (isAutoSync ? 3 : 10)
    let detailCallsMade = 0

    // Para cada corrida com potencial de PR, buscar os best_efforts
    for (const run of runsWithPotentialPRs) {
      if (detailCallsMade >= maxDetailCalls) break

      const details = await getActivityDetails(accessToken, run.id)
      apiCalls++
      detailCallsMade++

      // Se rate limit ou erro, pular essa atividade
      if (!details) continue

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
    if (runsWithPotentialPRs.length === 0) {
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
