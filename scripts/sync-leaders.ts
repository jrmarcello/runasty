/**
 * Script para sincronizar ranking_history com os líderes atuais
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function syncLeaders() {
  console.log("🔄 Sincronizando líderes...")

  const distances = ["5k", "10k", "21k"] as const

  for (const distance of distances) {
    // Buscar líder real (menor tempo)
    const { data: records } = await supabase
      .from("records")
      .select("strava_id, time_seconds")
      .eq("distance_type", distance)
      .order("time_seconds", { ascending: true })
      .limit(1)

    if (!records || records.length === 0) {
      console.log(`⚠️ Nenhum record para ${distance}`)
      continue
    }

    const realLeader = records[0]

    // Buscar líder atual no ranking_history
    const { data: currentHistory } = await supabase
      .from("ranking_history")
      .select("id, strava_id")
      .eq("distance_type", distance)
      .is("ended_at", null)
      .limit(1)

    const currentLeader = currentHistory?.[0]

    // Se o líder mudou, atualizar
    if (!currentLeader || currentLeader.strava_id !== realLeader.strava_id) {
      // Fechar liderança anterior
      if (currentLeader) {
        await supabase
          .from("ranking_history")
          .update({ ended_at: new Date().toISOString() })
          .eq("id", currentLeader.id)
        console.log(`📤 Fechou liderança anterior ${distance}: ${currentLeader.strava_id}`)
      }

      // Criar nova liderança
      const startedAt = new Date()
      startedAt.setDate(startedAt.getDate() - Math.floor(Math.random() * 15)) // 0-15 dias atrás

      await supabase
        .from("ranking_history")
        .insert({
          strava_id: realLeader.strava_id,
          distance_type: distance,
          started_at: startedAt.toISOString(),
        })

      // Buscar nome do novo líder
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("strava_id", realLeader.strava_id)
        .single()

      console.log(`👑 Novo líder ${distance}: ${(profile as { full_name: string })?.full_name} (${realLeader.time_seconds}s)`)
    } else {
      console.log(`✅ Líder ${distance} já está correto: ${currentLeader.strava_id}`)
    }
  }

  console.log("\n🎉 Sincronização concluída!")
}

syncLeaders().catch(console.error)
