"use client"

import { useEffect, useState } from "react"

interface LeadershipBadgeProps {
  startedAt: string
  isKing?: boolean
}

function formatDuration(startDate: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - startDate.getTime()

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return "agora"
}

export function LeadershipBadge({ startedAt, isKing = false }: LeadershipBadgeProps) {
  const startDate = new Date(startedAt)
  const [duration, setDuration] = useState(() => formatDuration(startDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(new Date(startedAt)))
    }, 60000)

    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        isKing
          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          : "bg-gray-700/50 text-gray-400"
      }`}
    >
      ⏱ {duration}
    </span>
  )
}
