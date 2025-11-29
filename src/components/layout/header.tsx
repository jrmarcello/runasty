"use client"

import { useState, useCallback } from "react"
import { UserMenu } from "./user-menu"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { useSyncContext } from "@/providers/SyncProvider"

interface HeaderProps {
  user: {
    name?: string | null
    image?: string | null
  }
}

// Formata tempo relativo
function formatTimeAgo(date: Date | null): string {
  if (!date) return ""
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  
  if (diffSecs < 60) return "agora"
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  return `${Math.floor(diffHours / 24)}d atrás`
}

export function Header({ user }: HeaderProps) {
  const { isSyncing: isAutoSyncing, manualSync, lastSyncAt } = useSyncContext()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    setSyncMessage(null)

    try {
      const result = await manualSync()

      if (result.success) {
        setSyncMessage({
          type: "success",
          text: result.message || "Sincronizado!"
        })
        router.refresh()
      } else if (result.skipped) {
        // Sync pulado por cooldown - não é erro
        setSyncMessage({
          type: "success",
          text: result.message || "Aguarde para sincronizar novamente"
        })
      } else {
        setSyncMessage({
          type: "error",
          text: result.message || "Erro ao sincronizar"
        })
      }
    } catch {
      setSyncMessage({
        type: "error",
        text: "Erro de conexão"
      })
    } finally {
      setIsSyncing(false)
      // Limpar mensagem após 5 segundos
      setTimeout(() => setSyncMessage(null), 5000)
    }
  }, [manualSync, router])

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-40 safe-area-top">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Logo size="sm" showText />

          <div className="flex items-center gap-3">
            {/* Indicador de última sincronização */}
            {lastSyncAt && !isSyncing && !isAutoSyncing && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>{formatTimeAgo(lastSyncAt)}</span>
              </div>
            )}
            
            {/* Indicador de sincronização em andamento */}
            {(isSyncing || isAutoSyncing) && (
              <div className="flex items-center gap-1.5 text-xs text-orange-500">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">Sincronizando...</span>
              </div>
            )}

            <UserMenu user={user} onSync={handleSync} isSyncing={isSyncing || isAutoSyncing} />
          </div>
        </div>
      </header>

      {/* Toast de sincronização */}
      {syncMessage && (
        <div
          className={`fixed top-16 sm:top-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-50 px-4 py-3 rounded-xl shadow-lg transition-all text-sm font-medium ${
            syncMessage.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {syncMessage.text}
        </div>
      )}
    </>
  )
}
