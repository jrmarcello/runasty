/**
 * Hook para sincronização automática com Strava
 * 
 * Estratégia:
 * - Sync no mount (quando usuário abre a página)
 * - Sync a cada 1 hora se a página ficar aberta
 * - Não bloqueia a UI durante sync
 */

"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useSession } from "next-auth/react"

interface AutoSyncState {
  isSyncing: boolean
  lastSyncMessage: string | null
  lastSyncAt: Date | null
}

const AUTO_SYNC_INTERVAL_MS = 60 * 60 * 1000 // 1 hora

export function useAutoSync() {
  const { data: session, status } = useSession()
  const [state, setState] = useState<AutoSyncState>({
    isSyncing: false,
    lastSyncMessage: null,
    lastSyncAt: null,
  })
  const hasSyncedOnMount = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const performSync = useCallback(async (isAutoSync = true) => {
    if (status !== "authenticated" || !session?.user?.stravaId) {
      return { success: false, skipped: true }
    }

    setState(prev => ({ ...prev, isSyncing: true }))

    try {
      const response = await fetch("/api/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAutoSync }),
      })

      const data = await response.json()

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncMessage: data.message || data.error,
        lastSyncAt: data.skipped ? prev.lastSyncAt : new Date(),
      }))

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

      return { success: false, skipped: false }
    }
  }, [session?.user?.stravaId, status])

  // Sync no mount (apenas uma vez)
  useEffect(() => {
    if (status === "authenticated" && !hasSyncedOnMount.current) {
      hasSyncedOnMount.current = true
      // Pequeno delay para não impactar o carregamento inicial
      const timeout = setTimeout(() => {
        performSync(true)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [status, performSync])

  // Sync periódico
  useEffect(() => {
    if (status === "authenticated") {
      intervalRef.current = setInterval(() => {
        performSync(true)
      }, AUTO_SYNC_INTERVAL_MS)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [status, performSync])

  // Função para sync manual (cooldown menor)
  const manualSync = useCallback(() => {
    return performSync(false)
  }, [performSync])

  return {
    ...state,
    manualSync,
    isAuthenticated: status === "authenticated",
  }
}
