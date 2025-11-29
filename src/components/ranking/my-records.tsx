"use client"

import { Activity } from "lucide-react"
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

const distances: { key: DistanceType; label: string }[] = [
  { key: "5k", label: "5K" },
  { key: "10k", label: "10K" },
  { key: "21k", label: "21K" },
]

export function MyRecords({ records }: MyRecordsProps) {
  const hasRecords = records.size > 0

  if (!hasRecords) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Sincronize para ver seus recordes
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {distances.map(({ key, label }) => {
        const record = records.get(key)
        return (
          <div
            key={key}
            className="flex-1 max-w-[110px] bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-3 sm:px-4 sm:py-4 text-center"
          >
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1 font-medium uppercase tracking-wide">
              <Activity size={10} className="sm:w-3 sm:h-3" /> {label}
            </div>
            <div className="font-mono text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              {record ? formatTime(record.time) : "--:--"}
            </div>
          </div>
        )
      })}
    </div>
  )
}
