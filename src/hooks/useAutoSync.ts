/**
 * Hook para sincronização com Strava
 * 
 * Estratégia simplificada (com webhook ativo):
 * - Webhook do Strava faz sync automático quando atividade é criada
 * - Usuário pode forçar sync manual quando necessário
 * - Busca última sincronização do banco para mostrar badge verde
 * - PRIMEIRO LOGIN: dispara sync automático completo
 */

"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

interface SyncState {
  isSyncing: boolean
  lastSyncMessage: string | null
  lastSyncAt: Date | null
  hasFetchedInitialSync: boolean
  isFirstSync: boolean
}

export function useAutoSync() {
  const { status } = useSession()
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSyncMessage: null,
    lastSyncAt: null,
    hasFetchedInitialSync: false,
    isFirstSync: false,
  })
  const fetchingRef = useRef(false)
  const firstSyncTriggeredRef = useRef(false)

  // Buscar última sincronização do banco ao montar
  useEffect(() => {
    if (status !== "authenticated") return
    if (state.hasFetchedInitialSync) return
    if (fetchingRef.current) return

    async function fetchLastSync() {
      fetchingRef.current = true
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          const lastSync = data.last_sync_at ? new Date(data.last_sync_at) : null
          setState(prev => ({
            ...prev,
            lastSyncAt: lastSync,
            hasFetchedInitialSync: true,
            isFirstSync: !lastSync, // Marca se é primeiro login
          }))
        }
      } catch {
        // Silently fail - não é crítico
      } finally {
        fetchingRef.current = false
      }
    }

    fetchLastSync()
  }, [status, state.hasFetchedInitialSync])

  // PRIMEIRO LOGIN: dispara sync automático completo para buscar todos os recordes
  useEffect(() => {
    if (!state.hasFetchedInitialSync) return
    if (!state.isFirstSync) return
    if (firstSyncTriggeredRef.current) return
    if (state.isSyncing) return

    async function triggerFirstSync() {
      firstSyncTriggeredRef.current = true
      console.log("🚀 Primeiro login detectado - iniciando sync completo...")
      
      setState(prev => ({ ...prev, isSyncing: true }))

      try {
        const response = await fetch("/api/strava/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAutoSync: false, force: true }),
        })

        const data = await response.json()
        console.log("✅ Sync inicial completo:", data.message)

        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncMessage: data.message || data.error,
          lastSyncAt: new Date(),
          isFirstSync: false, // Marca que não é mais primeiro sync
        }))

        // Dispara evento para atualizar ranking sem reload
        if (response.ok && !data.error) {
          window.dispatchEvent(new Event('rankingUpdated'))
        }
      } catch (error) {
        console.error("❌ Erro no sync inicial:", error)
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncMessage: "Erro ao sincronizar",
          isFirstSync: false,
        }))
      }
    }

    triggerFirstSync()
  }, [state.hasFetchedInitialSync, state.isFirstSync, state.isSyncing])

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

      return { success: false, skipped: false, message: "Erro de conexão" }
    }
  }, [status, state.lastSyncAt])

  return {
    ...state,
    manualSync,
    isAuthenticated: status === "authenticated",
  }
}
