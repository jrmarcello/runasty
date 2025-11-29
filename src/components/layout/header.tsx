"use client"

import { useState } from "react"
import { UserMenu } from "./user-menu"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user: {
    name?: string | null
    image?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  async function handleSync() {
    setIsSyncing(true)
    setSyncMessage(null)

    try {
      const response = await fetch("/api/strava/sync", { method: "POST" })
      const data = await response.json()

      if (response.ok) {
        const count = data.records?.length || 0
        setSyncMessage({
          type: "success",
          text: count > 0 
            ? `${count} recorde${count > 1 ? "s" : ""} atualizado${count > 1 ? "s" : ""}!`
            : "Tudo em dia! Nenhum novo recorde."
        })
        router.refresh()
      } else {
        setSyncMessage({
          type: "error",
          text: data.error || "Erro ao sincronizar"
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
  }

  return (
    <>
      <header className="border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-orange-500">Run</span>asty
          </h1>

          <UserMenu user={user} onSync={handleSync} isSyncing={isSyncing} />
        </div>
      </header>

      {/* Toast de sincronização */}
      {syncMessage && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            syncMessage.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {syncMessage.text}
        </div>
      )}
    </>
  )
}
