/**
 * Serviço de Sincronização com Strava
 * Issue #5: Buscar e processar dados do Strava
 */

import { createClient } from "@/lib/supabase/server"
import {
  getActivities,
  getActivityDetails,
  STRAVA_EFFORT_NAMES,
} from "./client"
import type { DistanceType, RecordInsert } from "@/types/database"

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
}

/**
 * Busca os melhores tempos do usuário no Strava e salva no banco
 */
export async function syncUserRecords(
  stravaId: number,
  accessToken: string
): Promise<SyncResult> {
  try {
    const supabase = await createClient()

    // Verificar última sincronização (rate limiting)
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_sync_at")
      .eq("strava_id", stravaId)
      .single()

    const profileData = profile as { last_sync_at: string | null } | null

    if (profileData?.last_sync_at) {
      const lastSync = new Date(profileData.last_sync_at)
      const now = new Date()
      const hoursSinceLastSync =
        (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastSync < 4) {
        return {
          success: false,
          message: `Aguarde ${Math.ceil(4 - hoursSinceLastSync)} horas para sincronizar novamente`,
        }
      }
    }

    // Buscar atividades recentes (últimas 100)
    const activities = await getActivities(accessToken, 1, 100)

    // Filtrar apenas corridas
    const runs = activities.filter(
      (a) => a.type === "Run" || a.sport_type === "Run"
    )

    // Mapa para guardar os melhores tempos encontrados
    const bestEfforts: Map<
      DistanceType,
      { time: number; date: string; activityId: number }
    > = new Map()

    // Para cada corrida, buscar os best_efforts
    for (const run of runs.slice(0, 20)) {
      // Limitar a 20 para não estourar rate limit
      try {
        const details = await getActivityDetails(accessToken, run.id)

        if (details.best_efforts) {
          for (const effort of details.best_efforts) {
            const distance = mapEffortToDistance(effort.name)
            
            // Pegar qualquer best effort da distância que nos interessa
            // e manter apenas o menor tempo
            if (distance) {
              const current = bestEfforts.get(distance)
              if (!current || effort.elapsed_time < current.time) {
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

    return {
      success: true,
      message: `Sincronização concluída! ${savedRecords.length} recordes encontrados.`,
      records: savedRecords,
    }
  } catch (error) {
    console.error("Erro na sincronização:", error)
    return {
      success: false,
      message: "Erro ao sincronizar com Strava",
      error: error instanceof Error ? error.message : "Erro desconhecido",
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
