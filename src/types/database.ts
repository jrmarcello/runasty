// Tipos gerados a partir do schema do banco de dados
// Issue #2: Modelagem do Banco de Dados
// NOTA: Usamos strava_id como chave primária (NextAuth, não Supabase Auth)

export type Gender = 'M' | 'F' | null

export type DistanceType = '5k' | '10k' | '21k'

// ============================================
// PROFILES
// ============================================
export interface Profile {
  strava_id: number // Chave primária
  username: string | null
  full_name: string | null
  avatar_url: string | null
  sex: Gender
  strava_access_token: string | null
  strava_refresh_token: string | null
  strava_token_expires_at: string | null // ISO timestamp
  last_sync_at: string | null // ISO timestamp
  consent_public_ranking: boolean | null // Consentimento para ranking público (NULL = não perguntado)
  consent_at: string | null // ISO timestamp do consentimento
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  strava_id: number // Chave primária - obrigatório
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  sex?: Gender
  strava_access_token?: string | null
  strava_refresh_token?: string | null
  strava_token_expires_at?: string | null
  last_sync_at?: string | null
  consent_public_ranking?: boolean
  consent_at?: string | null
}

export interface ProfileUpdate {
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  sex?: Gender
  strava_access_token?: string | null
  strava_refresh_token?: string | null
  strava_token_expires_at?: string | null
  last_sync_at?: string | null
  consent_public_ranking?: boolean
  consent_at?: string | null
}

// ============================================
// RECORDS
// ============================================
export interface Record {
  id: string // UUID
  strava_id: number // FK para profiles.strava_id
  distance_type: DistanceType
  time_seconds: number
  achieved_at: string | null // Date string
  strava_activity_id: number | null
  created_at: string
  updated_at: string
}

export interface RecordInsert {
  strava_id: number // FK para profiles.strava_id
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
  strava_id: number // FK para profiles.strava_id
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
  strava_id: number
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
  strava_id: number
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
