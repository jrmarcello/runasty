/**
 * Seed: Popular banco com corredores fictícios para testes
 * 
 * Uso: npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Corredores fictícios com tempos realistas
const runners = [
  // Homens - Elite
  { name: "Carlos Silva", username: "carlosrun", sex: "M", 
    times: { "5k": 15*60+30, "10k": 32*60+45, "21k": 72*60+10 } }, // 15:30, 32:45, 1:12:10
  { name: "Bruno Oliveira", username: "brunofast", sex: "M",
    times: { "5k": 16*60+12, "10k": 34*60+20, "21k": 76*60+30 } }, // 16:12, 34:20, 1:16:30
  
  // Homens - Intermediário
  { name: "Pedro Santos", username: "pedrorun", sex: "M",
    times: { "5k": 20*60+45, "10k": 44*60+30, "21k": 98*60+0 } }, // 20:45, 44:30, 1:38:00
  { name: "Lucas Ferreira", username: "lucasf", sex: "M",
    times: { "5k": 22*60+30, "10k": 48*60+15, "21k": 105*60+20 } }, // 22:30, 48:15, 1:45:20
  { name: "Rafael Costa", username: "rafaelc", sex: "M",
    times: { "5k": 24*60+0, "10k": 52*60+30, "21k": 115*60+0 } }, // 24:00, 52:30, 1:55:00
  { name: "Thiago Mendes", username: "thiagom", sex: "M",
    times: { "5k": 25*60+15, "10k": 55*60+0, "21k": 120*60+45 } }, // 25:15, 55:00, 2:00:45
  
  // Homens - Iniciante
  { name: "Fernando Lima", username: "fernandol", sex: "M",
    times: { "5k": 28*60+30, "10k": 62*60+0, "21k": 135*60+30 } }, // 28:30, 1:02:00, 2:15:30
  { name: "João Paulo", username: "jprun", sex: "M",
    times: { "5k": 30*60+45, "10k": 68*60+20, "21k": 150*60+0 } }, // 30:45, 1:08:20, 2:30:00
  
  // Mulheres - Elite
  { name: "Ana Beatriz", username: "anabrun", sex: "F",
    times: { "5k": 17*60+45, "10k": 37*60+30, "21k": 82*60+15 } }, // 17:45, 37:30, 1:22:15
  { name: "Camila Rocha", username: "camilar", sex: "F",
    times: { "5k": 18*60+30, "10k": 39*60+45, "21k": 88*60+30 } }, // 18:30, 39:45, 1:28:30
  
  // Mulheres - Intermediário
  { name: "Juliana Martins", username: "julianam", sex: "F",
    times: { "5k": 23*60+15, "10k": 50*60+0, "21k": 110*60+20 } }, // 23:15, 50:00, 1:50:20
  { name: "Patricia Alves", username: "patriciaa", sex: "F",
    times: { "5k": 25*60+30, "10k": 54*60+45, "21k": 118*60+0 } }, // 25:30, 54:45, 1:58:00
  { name: "Fernanda Souza", username: "fernandasouza", sex: "F",
    times: { "5k": 27*60+0, "10k": 58*60+30, "21k": 128*60+15 } }, // 27:00, 58:30, 2:08:15
  
  // Mulheres - Iniciante
  { name: "Mariana Costa", username: "maric", sex: "F",
    times: { "5k": 32*60+45, "10k": 72*60+0, "21k": 158*60+30 } }, // 32:45, 1:12:00, 2:38:30
  { name: "Isabela Dias", username: "isabelad", sex: "F",
    times: { "5k": 35*60+0, "10k": 78*60+30, "21k": 172*60+0 } }, // 35:00, 1:18:30, 2:52:00
  
  // Sem gênero definido
  { name: "Alex Runner", username: "alexrun", sex: null,
    times: { "5k": 21*60+30, "10k": 46*60+15, "21k": 102*60+0 } }, // 21:30, 46:15, 1:42:00
]

async function seed() {
  console.log("🌱 Iniciando seed...")

  for (const runner of runners) {
    // Gerar strava_id fictício (números altos para não conflitar)
    const stravaId = 900000000 + Math.floor(Math.random() * 100000)

    // Criar perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        strava_id: stravaId,
        username: runner.username,
        full_name: runner.name,
        avatar_url: null, // Usar fallback de iniciais
        sex: runner.sex,
      }, { onConflict: "strava_id" })

    if (profileError) {
      console.error(`❌ Erro ao criar perfil ${runner.name}:`, profileError.message)
      continue
    }

    // Criar records
    for (const [distance, seconds] of Object.entries(runner.times)) {
      // Data aleatória nos últimos 2 anos
      const randomDays = Math.floor(Math.random() * 730)
      const achievedAt = new Date()
      achievedAt.setDate(achievedAt.getDate() - randomDays)

      const { error: recordError } = await supabase
        .from("records")
        .upsert({
          strava_id: stravaId,
          distance_type: distance,
          time_seconds: seconds,
          achieved_at: achievedAt.toISOString(),
          strava_activity_id: Math.floor(Math.random() * 10000000000),
        }, { onConflict: "strava_id,distance_type" })

      if (recordError) {
        console.error(`❌ Erro ao criar record ${runner.name} ${distance}:`, recordError.message)
      }
    }

    console.log(`✅ ${runner.name} (${runner.sex || "N/A"}) adicionado`)
  }

  // Atualizar ranking_history para o líder de cada distância
  const distances = ["5k", "10k", "21k"] as const

  for (const distance of distances) {
    // Buscar líder atual
    const { data: leader } = await supabase
      .from("records")
      .select("strava_id, time_seconds")
      .eq("distance_type", distance)
      .order("time_seconds", { ascending: true })
      .limit(1)
      .single()

    if (leader) {
      // Limpar histórico anterior
      await supabase
        .from("ranking_history")
        .delete()
        .eq("distance_type", distance)

      // Criar novo registro de liderança
      const startedAt = new Date()
      startedAt.setDate(startedAt.getDate() - Math.floor(Math.random() * 30))

      await supabase
        .from("ranking_history")
        .insert({
          strava_id: leader.strava_id,
          distance_type: distance,
          started_at: startedAt.toISOString(),
        })

      console.log(`👑 Líder ${distance}: strava_id ${leader.strava_id}`)
    }
  }

  console.log("\n🎉 Seed concluído!")
}

seed().catch(console.error)
