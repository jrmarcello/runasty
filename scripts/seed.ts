/**
 * Seed: Popular banco com corredores fictícios para testes
 * 
 * IMPORTANTE: Todos os tempos de 5K e 10K são PIORES que os do Marcelo Jr:
 * - 5K: 27:54 (1674s)
 * - 10K: 63:45 (3825s)
 * 
 * No 21K, outros corredores lideram (Marcelo não tem tempo de 21K)
 * 
 * Uso: npx tsx scripts/seed.ts
 */

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Carregar variáveis de ambiente
config({ path: ".env.local" })

// Usar service_role para bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tempos do Marcelo Jr (referência - NÃO incluir no seed, ele vai logar e sincronizar)
// 5K: 27:54 (1674s)
// 10K: 63:45 (3825s)
// 21K: não tem

// Corredores fictícios - todos com tempos PIORES que Marcelo no 5K e 10K
const runners = [
  // ==========================================
  // HOMENS - Tempos piores que Marcelo no 5K/10K
  // ==========================================
  { name: "Carlos Silva", username: "carlosrun", sex: "M", 
    times: { "5k": 28*60+30, "10k": 65*60+0, "21k": 140*60+0 } },  // 28:30, 65:00, 2:20:00
  { name: "Bruno Oliveira", username: "brunofast", sex: "M",
    times: { "5k": 29*60+15, "10k": 66*60+30, "21k": 145*60+0 } }, // 29:15, 66:30, 2:25:00
  { name: "Rafael Costa", username: "rafaelc", sex: "M",
    times: { "5k": 30*60+0, "10k": 64*60+30, "21k": 135*60+0 } },  // 30:00, 64:30, 2:15:00 (Rei do 21K!)
  { name: "Pedro Santos", username: "pedrorun", sex: "M",
    times: { "5k": 31*60+20, "10k": 68*60+0, "21k": 148*60+0 } },  // 31:20, 68:00, 2:28:00
  { name: "Lucas Ferreira", username: "lucasf", sex: "M",
    times: { "5k": 32*60+45, "10k": 70*60+15, "21k": 155*60+0 } }, // 32:45, 70:15, 2:35:00
  { name: "Thiago Mendes", username: "thiagom", sex: "M",
    times: { "5k": 33*60+30, "10k": 72*60+0, "21k": 160*60+0 } },  // 33:30, 72:00, 2:40:00
  { name: "André Gomes", username: "andreg", sex: "M",
    times: { "5k": 34*60+15, "10k": 74*60+30, "21k": 165*60+0 } }, // 34:15, 74:30, 2:45:00
  { name: "Felipe Rodrigues", username: "feliper", sex: "M",
    times: { "5k": 35*60+0, "10k": 76*60+0, "21k": 170*60+0 } },   // 35:00, 76:00, 2:50:00
  { name: "Fernando Lima", username: "fernandol", sex: "M",
    times: { "5k": 36*60+30, "10k": 78*60+0, "21k": 175*60+0 } },  // 36:30, 78:00, 2:55:00
  { name: "João Paulo", username: "jprun", sex: "M",
    times: { "5k": 38*60+0, "10k": 82*60+0, "21k": 180*60+0 } },   // 38:00, 82:00, 3:00:00
  { name: "Ricardo Nunes", username: "ricardon", sex: "M",
    times: { "5k": 40*60+0, "10k": 85*60+0, "21k": 185*60+0 } },   // 40:00, 85:00, 3:05:00
  { name: "Gustavo Almeida", username: "gustavoa", sex: "M",
    times: { "5k": 42*60+0, "10k": 90*60+0, "21k": 195*60+0 } },   // 42:00, 90:00, 3:15:00

  // ==========================================
  // MULHERES - Tempos piores que Marcelo no 5K/10K
  // ==========================================
  { name: "Ana Beatriz", username: "anabrun", sex: "F",
    times: { "5k": 29*60+0, "10k": 64*60+0, "21k": 138*60+0 } },   // 29:00, 64:00, 2:18:00 (Rainha do 21K F!)
  { name: "Camila Rocha", username: "camilar", sex: "F",
    times: { "5k": 30*60+30, "10k": 66*60+0, "21k": 142*60+0 } },  // 30:30, 66:00, 2:22:00
  { name: "Juliana Martins", username: "julianam", sex: "F",
    times: { "5k": 31*60+45, "10k": 68*60+30, "21k": 150*60+0 } }, // 31:45, 68:30, 2:30:00
  { name: "Fernanda Souza", username: "fernandasouza", sex: "F",
    times: { "5k": 33*60+0, "10k": 70*60+0, "21k": 155*60+0 } },   // 33:00, 70:00, 2:35:00
  { name: "Patricia Alves", username: "patalves", sex: "F",
    times: { "5k": 34*60+30, "10k": 73*60+0, "21k": 162*60+0 } },  // 34:30, 73:00, 2:42:00
  { name: "Mariana Costa", username: "maricosta", sex: "F",
    times: { "5k": 36*60+0, "10k": 77*60+0, "21k": 170*60+0 } },   // 36:00, 77:00, 2:50:00
  { name: "Letícia Barbosa", username: "leticiab", sex: "F",
    times: { "5k": 38*60+0, "10k": 80*60+0, "21k": 178*60+0 } },   // 38:00, 80:00, 2:58:00
  { name: "Isabela Dias", username: "isabelad", sex: "F",
    times: { "5k": 40*60+0, "10k": 85*60+0, "21k": 185*60+0 } },   // 40:00, 85:00, 3:05:00
  { name: "Renata Oliveira", username: "renatao", sex: "F",
    times: { "5k": 42*60+0, "10k": 88*60+0, "21k": 190*60+0 } },   // 42:00, 88:00, 3:10:00
  { name: "Carla Santos", username: "carlas", sex: "F",
    times: { "5k": 45*60+0, "10k": 95*60+0, "21k": 200*60+0 } },   // 45:00, 95:00, 3:20:00
]

async function seed() {
  console.log("🌱 Iniciando seed...")
  console.log(`📊 Total de corredores: ${runners.length}`)

  for (const runner of runners) {
    // Usar ID fixo se definido, senão gerar aleatório
    const stravaId = (runner as { stravaId?: number }).stravaId || 
      900000000 + Math.floor(Math.random() * 100000)

    // Criar perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        strava_id: stravaId,
        username: runner.username,
        full_name: runner.name,
        avatar_url: null, // Usar fallback de iniciais
        sex: runner.sex,
        last_sync_at: new Date().toISOString(), // Simula sync recente
        consent_public_ranking: true, // Todos os corredores fictícios aceitaram os termos
        consent_at: new Date().toISOString(),
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
          record_time_seconds: leader.time_seconds,
        })

      console.log(`👑 Líder ${distance}: strava_id ${leader.strava_id}`)
    }
  }

  console.log("\n🎉 Seed concluído!")
  console.log("📌 Todos os corredores têm tempos PIORES que Marcelo no 5K e 10K")
  console.log("📌 Marcelo Jr: 5K = 27:54 (1674s), 10K = 63:45 (3825s)")
  console.log("👑 Ao fazer login e sincronizar, Marcelo será o Rei do 5K e 10K!")
}

seed().catch(console.error)
