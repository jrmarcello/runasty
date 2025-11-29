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
 * Busca detalhes de uma atividade específica (inclui best_efforts)
 */
export async function getActivityDetails(
  accessToken: string,
  activityId: number
): Promise<StravaActivity & { best_efforts: StravaBestEffort[] }> {
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}?include_all_efforts=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao buscar atividade: ${response.status} - ${error}`)
  }

  return response.json()
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
  "5k": "5k",
  "10k": "10k",
  "21k": "Half-Marathon",
} as const
