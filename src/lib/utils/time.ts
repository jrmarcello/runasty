/**
 * Utilitários para manipulação de tempos de corrida
 */

/**
 * Converte segundos para formato HH:MM:SS ou MM:SS
 * @param seconds - Tempo em segundos
 * @returns Tempo formatado (ex: "25:30" ou "1:45:30")
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Converte tempo no formato HH:MM:SS ou MM:SS para segundos
 * @param time - Tempo no formato string (ex: "25:30" ou "1:45:30")
 * @returns Tempo em segundos
 */
export function parseTime(time: string): number {
  const parts = time.split(':').map(Number)
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  }
  
  return 0
}

/**
 * Calcula pace (min/km) a partir do tempo e distância
 * @param seconds - Tempo em segundos
 * @param distanceKm - Distância em km
 * @returns Pace formatado (ex: "5:30/km")
 */
export function calculatePace(seconds: number, distanceKm: number): string {
  const paceSeconds = seconds / distanceKm
  const paceMinutes = Math.floor(paceSeconds / 60)
  const paceSecs = Math.floor(paceSeconds % 60)
  
  return `${paceMinutes}:${paceSecs.toString().padStart(2, '0')}/km`
}

/**
 * Retorna a distância em km baseado no tipo
 */
export function getDistanceKm(distanceType: '5k' | '10k' | '21k'): number {
  const distances: Record<string, number> = {
    '5k': 5,
    '10k': 10,
    '21k': 21.0975, // Meia maratona oficial
  }
  return distances[distanceType]
}

/**
 * Formata duração de liderança
 * @param startedAt - Data de início da liderança (ISO string)
 * @returns Duração formatada (ex: "2d 14h 30m")
 */
export function formatLeadershipDuration(startedAt: string): string {
  const start = new Date(startedAt)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Labels amigáveis para tipos de distância
 */
export const distanceLabels: Record<string, string> = {
  '5k': '5K',
  '10k': '10K',
  '21k': 'Meia Maratona',
}

/**
 * Labels amigáveis para gênero
 */
export const genderLabels: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  null: 'Geral',
}
