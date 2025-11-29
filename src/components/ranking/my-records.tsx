"use client"

import type { DistanceType } from "@/types/database"

interface MyRecordsProps {
  records: Map<DistanceType, { time: number; date: string | null }>
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

const distances: { key: DistanceType; label: string; emoji: string }[] = [
  { key: "5k", label: "5K", emoji: "🏃" },
  { key: "10k", label: "10K", emoji: "🏃‍♂️" },
  { key: "21k", label: "21K", emoji: "🏃‍♀️" },
]

export function MyRecords({ records }: MyRecordsProps) {
  const hasRecords = records.size > 0

  if (!hasRecords) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <p className="text-gray-400 text-sm text-center">
          Sincronize para ver seus recordes
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-2 sm:gap-4 justify-center">
      {distances.map(({ key, label, emoji }) => {
        const record = records.get(key)
        return (
          <div
            key={key}
            className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]"
          >
            <div className="text-xs text-gray-400 mb-1">
              {emoji} {label}
            </div>
            <div className="font-mono text-sm sm:text-lg font-bold text-white">
              {record ? formatTime(record.time) : "--:--"}
            </div>
          </div>
        )
      })}
    </div>
  )
}
