/**
 * Hook para sincronização com Strava
 * 
 * Estratégia simplificada (com webhook ativo):
 * - Webhook do Strava faz sync automático quando atividade é criada
 * - Usuário pode forçar sync manual quando necessário
 * - Busca última sincronização do banco para mostrar badge verde
 */

"use client"

import { useCallback, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface SyncState {
  isSyncing: boolean
  lastSyncMessage: string | null
  lastSyncAt: Date | null
}

export function useAutoSync() {
  const { status } = useSession()
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSyncMessage: null,
    lastSyncAt: null,
  })

  // Buscar última sincronização do banco ao montar
  useEffect(() => {
    if (status !== "authenticated") return

    async function fetchLastSync() {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          if (data.last_sync_at) {
            setState(prev => ({
              ...prev,
              lastSyncAt: new Date(data.last_sync_at),
            }))
          }
        }
      } catch {
        // Silently fail - não é crítico
      }
    }

    fetchLastSync()
  }, [status])

  // Sync manual (força busca de novos dados)
  const manualSync = useCallback(async () => {
    if (status !== "authenticated") {
      return { success: false, skipped: true, message: "Não autenticado" }
    }

    setState(prev => ({ ...prev, isSyncing: true }))

    try {
      const response = await fetch("/api/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAutoSync: false, force: true }),
      })

      const data = await response.json()

      setState({
        isSyncing: false,
        lastSyncMessage: data.message || data.error,
        lastSyncAt: data.skipped ? state.lastSyncAt : new Date(),
      })

      return {
        success: response.ok && !data.error,
        skipped: data.skipped || false,
        message: data.message || data.error,
      }
    } catch {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncMessage: "Erro ao conectar com o servidor",
      }))

      return { success: false, skipped: false, message: "Erro de conexão" }
    }
  }, [status, state.lastSyncAt])

  return {
    ...state,
    manualSync,
    isAuthenticated: status === "authenticated",
  }
}
