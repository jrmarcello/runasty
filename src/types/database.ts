// Tipos gerados a partir do schema do banco de dados
// Issue #2: Modelagem do Banco de Dados

export type Gender = 'M' | 'F' | null

export type DistanceType = '5k' | '10k' | '21k'

// ============================================
// PROFILES
// ============================================
export interface Profile {
  id: string // UUID
  strava_id: number | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  sex: Gender
  strava_access_token: string | null
  strava_refresh_token: string | null
  strava_token_expires_at: string | null // ISO timestamp
  last_sync_at: string | null // ISO timestamp
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id?: string // Opcional quando usando strava_id como chave
  strava_id: number // Obrigatório - usado como identificador único do Strava
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  sex?: Gender
  strava_access_token?: string | null
  strava_refresh_token?: string | null
  strava_token_expires_at?: string | null
  last_sync_at?: string | null
}

export interface ProfileUpdate {
  strava_id?: number | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  sex?: Gender
  strava_access_token?: string | null
  strava_refresh_token?: string | null
  strava_token_expires_at?: string | null
  last_sync_at?: string | null
}

// ============================================
// RECORDS
// ============================================
export interface Record {
  id: string // UUID
  user_id: string // UUID
  distance_type: DistanceType
  time_seconds: number
  achieved_at: string | null // Date string
  strava_activity_id: number | null
  created_at: string
  updated_at: string
}

export interface RecordInsert {
  user_id: string
  distance_type: DistanceType
  time_seconds: number
  achieved_at?: string | null
  strava_activity_id?: number | null
}

export interface RecordUpdate {
  time_seconds?: number
  achieved_at?: string | null
  strava_activity_id?: number | null
}

// ============================================
// RANKING HISTORY
// ============================================
export interface RankingHistory {
  id: string // UUID
  user_id: string // UUID
  distance_type: DistanceType
  gender_filter: Gender
  started_at: string // ISO timestamp
  ended_at: string | null // ISO timestamp, null = ainda é líder
  record_time_seconds: number
  created_at: string
}

// ============================================
// VIEWS
// ============================================
export interface CurrentRanking {
  id: string
  user_id: string
  distance_type: DistanceType
  time_seconds: number
  achieved_at: string | null
  full_name: string | null
  username: string | null
  avatar_url: string | null
  sex: Gender
  position: number
}

export interface CurrentLeader {
  id: string
  user_id: string
  distance_type: DistanceType
  gender_filter: Gender
  started_at: string
  record_time_seconds: number
  full_name: string | null
  username: string | null
  avatar_url: string | null
  time_as_leader: string // Interval como string
}

// ============================================
// DATABASE SCHEMA (para Supabase client)
// ============================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      records: {
        Row: Record
        Insert: RecordInsert
        Update: RecordUpdate
      }
      ranking_history: {
        Row: RankingHistory
        Insert: never // Gerenciado pelo sistema
        Update: never
      }
    }
    Views: {
      current_rankings: {
        Row: CurrentRanking
      }
      current_leaders: {
        Row: CurrentLeader
      }
    }
  }
}
