/**
 * Hook para sincronização com Strava
 * 
 * Estratégia simplificada (com webhook ativo):
 * - Webhook do Strava faz sync automático quando atividade é criada
 * - Usuário pode forçar sync manual quando necessário
 * - Sem sync automático no frontend (desnecessário com webhook)
 */

"use client"

import { useCallback, useState } from "react"
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
