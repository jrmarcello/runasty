/**
 * Botão de Sincronização Manual com Strava
 * 
 * Exibe estado da sincronização e permite sync manual
 */

"use client"

import { RefreshCw, Check, AlertCircle, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"

interface SyncButtonProps {
  onSync?: () => Promise<{ success: boolean; message?: string }>
  isSyncing?: boolean
  className?: string
  variant?: "icon" | "full"
}

export function SyncButton({ 
  onSync, 
  isSyncing = false,
  className = "",
  variant = "icon"
}: SyncButtonProps) {
  const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)

  const handleSync = useCallback(async () => {
    if (!onSync || status === "syncing" || isSyncing) return

    setStatus("syncing")
    setMessage(null)

    try {
      const result = await onSync()
      
      if (result.success) {
        setStatus("success")
        setMessage(result.message || "Sincronizado!")
        // Reset após 3 segundos
        setTimeout(() => setStatus("idle"), 3000)
      } else {
        setStatus("error")
        setMessage(result.message || "Erro ao sincronizar")
        // Reset após 5 segundos
        setTimeout(() => setStatus("idle"), 5000)
      }
    } catch {
      setStatus("error")
      setMessage("Erro ao conectar")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }, [onSync, status, isSyncing])

  const isLoading = status === "syncing" || isSyncing

  if (variant === "icon") {
    return (
      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isLoading 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : status === "success"
            ? "bg-green-100 text-green-600 hover:bg-green-200"
            : status === "error"
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }
          ${className}
        `}
        title={message || "Sincronizar com Strava"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === "success" ? (
          <Check className="w-5 h-5" />
        ) : status === "error" ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
      </button>
    )
  }

  // Variant "full" - botão com texto
  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${isLoading 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : status === "success"
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : status === "error"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
        }
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Sincronizando...</span>
        </>
      ) : status === "success" ? (
        <>
          <Check className="w-4 h-4" />
          <span>Sincronizado!</span>
        </>
      ) : status === "error" ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Tentar novamente</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          <span>Sincronizar Strava</span>
        </>
      )}
    </button>
  )
}
