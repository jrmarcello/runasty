/**
 * Cliente para a API do Strava
 * Issue #5: Serviço de Sincronização Strava
 */

const STRAVA_API_BASE = "https://www.strava.com/api/v3"

export interface StravaAthlete {
  id: number
  username: string
  firstname: string
  lastname: string
  sex: "M" | "F"
  profile: string
  profile_medium: string
}

export interface StravaActivity {
  id: number
  name: string
  distance: number // em metros
  moving_time: number // em segundos
  elapsed_time: number
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  average_speed: number
  max_speed: number
  pr_count: number
  achievement_count: number
}

export interface StravaStats {
  biggest_ride_distance: number
  biggest_climb_elevation_gain: number
  recent_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  all_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
}

export interface StravaBestEffort {
  id: number
  name: string
  elapsed_time: number
  moving_time: number
  start_date: string
  start_date_local: string
  distance: number
  pr_rank: number | null
  activity: {
    id: number
  }
}

/**
 * Busca o perfil do atleta autenticado
 */
export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao buscar atleta: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Busca as estatísticas do atleta
 */
export async function getAthleteStats(
  accessToken: string,
  athleteId: number
): Promise<StravaStats> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${athleteId}/stats`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao buscar stats: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Busca atividades do atleta
 */
export async function getActivities(
  accessToken: string,
  page = 1,
  perPage = 30
): Promise<StravaActivity[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao buscar atividades: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Busca atividades do atleta após uma data específica
 * Usado para sync incremental - só busca atividades novas
 * @param afterTimestamp Unix timestamp em segundos
 */
export async function getActivitiesAfter(
  accessToken: string,
  afterTimestamp: number,
  perPage = 50
): Promise<StravaActivity[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?after=${afterTimestamp}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      // Timeout de 10 segundos para evitar hanging
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao buscar atividades: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Busca TODAS as atividades do atleta com paginação
 * Usado no primeiro sync para pegar histórico completo
 * Retorna apenas corridas com potencial de PR (achievement_count > 0 ou pr_count > 0)
 */
export async function getAllRunsWithPRs(
  accessToken: string,
  maxPages = 3 // Limita a 3 páginas (300 atividades) para evitar rate limit
): Promise<StravaActivity[]> {
  const allRuns: StravaActivity[] = []
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await fetch(
        `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          // Timeout de 8 segundos por página
          signal: AbortSignal.timeout(8000),
        }
      )

      if (!response.ok) {
        console.error(`Erro na página ${page}:`, response.status)
        break
      }

      const activities: StravaActivity[] = await response.json()
      
      // Se não há mais atividades, parar
      if (activities.length === 0) {
        break
      }

      // Filtrar apenas corridas com potencial de PR
      const runsWithPRs = activities.filter(
        (a) => 
          (a.type === "Run" || a.sport_type === "Run") &&
          (a.achievement_count > 0 || a.pr_count > 0 || a.distance >= 5000)
      )

      allRuns.push(...runsWithPRs)
      
      // Se página não está cheia, não há mais atividades
      if (activities.length < 100) {
        break
      }
    } catch (error) {
      console.error(`Timeout ou erro na página ${page}:`, error)
      break
    }
  }

  return allRuns
}

/**
 * Busca detalhes de uma atividade específica (inclui best_efforts)
 * Retorna null se rate limit ou erro (não quebra o sync)
 */
export async function getActivityDetails(
  accessToken: string,
  activityId: number
): Promise<(StravaActivity & { best_efforts: StravaBestEffort[] }) | null> {
  try {
    const response = await fetch(
      `${STRAVA_API_BASE}/activities/${activityId}?include_all_efforts=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      }
    )

    if (response.status === 429) {
      // Rate limit - não logar em prod para evitar poluição
      return null
    }

    if (!response.ok) {
      // Erro de API - manter silencioso (retorna null)
      return null
    }

    return response.json()
  } catch {
    // Timeout ou erro de rede - retorna null silenciosamente
    return null
  }
}

/**
 * Distâncias que nos interessam (em metros)
 */
export const TARGET_DISTANCES = {
  "5k": 5000,
  "10k": 10000,
  "21k": 21097.5, // Meia maratona oficial
} as const

/**
 * Nomes dos best efforts no Strava para as distâncias
 */
export const STRAVA_EFFORT_NAMES = {
  "5k": "5K",
  "10k": "10K",
  "21k": "Half-Marathon",
} as const

/**
 * Resposta do refresh token do Strava
 */
export interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  token_type: string
}

/**
 * Renova o access token usando o refresh token
 */
export async function refreshStravaToken(
  refreshToken: string
): Promise<StravaTokenResponse> {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao renovar token: ${response.status} - ${error}`)
  }

  return response.json()
}
