/**
 * Provider de Sincronização com Strava
 * 
 * Gerencia sincronização automática e fornece contexto para componentes
 */

"use client"

import { createContext, useContext, ReactNode } from "react"
import { useAutoSync } from "@/hooks/useAutoSync"

interface SyncContextType {
  isSyncing: boolean
  lastSyncMessage: string | null
  lastSyncAt: Date | null
  manualSync: () => Promise<{ success: boolean; skipped: boolean; message?: string }>
  isAuthenticated: boolean
}

const SyncContext = createContext<SyncContextType | null>(null)

export function SyncProvider({ children }: { children: ReactNode }) {
  const syncState = useAutoSync()

  return (
    <SyncContext.Provider value={syncState}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSyncContext() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error("useSyncContext deve ser usado dentro de SyncProvider")
  }
  return context
}

// Hook simplificado para componentes que só precisam do sync manual
export function useSync() {
  const context = useContext(SyncContext)
  
  // Se não estiver no provider, retorna funções no-op
  if (!context) {
    return {
      isSyncing: false,
      manualSync: async () => ({ success: false, skipped: true, message: "Sync não disponível" }),
    }
  }

  return {
    isSyncing: context.isSyncing,
    manualSync: context.manualSync,
  }
}
