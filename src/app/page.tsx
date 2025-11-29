import { redirect } from "next/navigation"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { LogoutButton } from "@/components/auth/logout-button"
import { SyncButton } from "@/components/strava/sync-button"
import { createClient } from "@/lib/supabase/server"
import type { DistanceType } from "@/types/database"

// Formata segundos para mm:ss ou hh:mm:ss
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export default async function Home() {
  const session = await auth()

  // Se não estiver logado, redireciona para login
  if (!session?.user) {
    redirect("/login")
  }

  const { user } = session
  
  // Buscar records do usuário
  const supabase = await createClient()
  const { data: records } = await supabase
    .from("records")
    .select("distance_type, time_seconds, achieved_at")
    .eq("strava_id", user.stravaId)

  // Criar mapa de records por distância
  const recordsMap = new Map<DistanceType, { time: number; date: string | null }>()
  if (records) {
    for (const record of records) {
      recordsMap.set(record.distance_type as DistanceType, {
        time: record.time_seconds,
        date: record.achieved_at,
      })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-orange-500">Run</span>asty
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-gray-300">{user.name}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Bem-vindo, {user.name?.split(" ")[0]}! 🎉
          </h2>
          <p className="text-gray-400">
            Sincronize seus dados do Strava para ver seus recordes pessoais.
          </p>
        </div>

        {/* Sync Button */}
        <div className="max-w-md mx-auto mb-12">
          <SyncButton />
        </div>

        {/* Records Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {(["5k", "10k", "21k"] as DistanceType[]).map((distance) => {
            const record = recordsMap.get(distance)
            const displayDistance = distance.toUpperCase()
            
            return (
              <div
                key={distance}
                className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 hover:border-orange-500/50 transition-colors"
              >
                <span className="text-4xl mb-4 block">🏃‍♂️</span>
                <h3 className="text-xl font-bold text-orange-400 mb-2">
                  {displayDistance}
                </h3>
                {record ? (
                  <>
                    <p className="text-2xl font-bold text-white mb-1">
                      {formatTime(record.time)}
                    </p>
                    {record.date && (
                      <p className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Sincronize para ver seu tempo
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Status */}
        <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto text-center">
          <p className="text-xs text-gray-500">
            Milestone 2 - Integração de Dados
          </p>
        </div>
      </div>
    </main>
  )
}
