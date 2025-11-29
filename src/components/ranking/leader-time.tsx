"use client"

/**
 * Componente que mostra há quanto tempo o líder está no topo
 * Issue #10: Componente Visual "Tempo na Liderança"
 */

import { useEffect, useState } from "react"

interface LeaderTimeProps {
  startedAt: string // ISO timestamp
  leaderName: string
}

function formatDuration(startDate: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - startDate.getTime()

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days > 0) {
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m`
  }

  return "agora"
}

export function LeaderTime({ startedAt, leaderName }: LeaderTimeProps) {
  const startDate = new Date(startedAt)
  const [duration, setDuration] = useState<string>(() => formatDuration(startDate))

  useEffect(() => {
    // Atualizar a cada minuto
    const interval = setInterval(() => {
      setDuration(formatDuration(new Date(startedAt)))
    }, 60000)

    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-2xl">👑</span>
        <span className="text-yellow-400 font-bold text-lg">{leaderName}</span>
      </div>
      <p className="text-gray-300 text-sm mb-1">No topo há</p>
      <p className="text-3xl font-bold text-white">{duration}</p>
    </div>
  )
}
