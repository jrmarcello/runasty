/**
 * Seed: Popular banco com corredores fictícios para testes
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

// Corredores fictícios com tempos realistas
// Tempos baseados em corredores amadores competitivos brasileiros
const runners = [
  // ==========================================
  // VOCÊ - Marcelo Jr (Rei do 5K! 👑)
  // ==========================================
  { name: "Marcelo Jr", username: "marcelojr", sex: "M",
    times: { "5k": 18*60+45, "10k": 42*60+30, "21k": 95*60+0 }, // 18:45 no 5K = Rei!
    stravaId: 12345678 }, // ID fixo para você

  // ==========================================
  // HOMENS - Elite Amador (Sub-20 no 5K)
  // ==========================================
  { name: "Carlos Silva", username: "carlosrun", sex: "M", 
    times: { "5k": 19*60+10, "10k": 40*60+15, "21k": 88*60+30 } },
  { name: "Bruno Oliveira", username: "brunofast", sex: "M",
    times: { "5k": 19*60+45, "10k": 41*60+20, "21k": 90*60+15 } },
  { name: "Rafael Costa", username: "rafaelc", sex: "M",
    times: { "5k": 20*60+30, "10k": 38*60+45, "21k": 85*60+0 } }, // Rei do 10K!
  { name: "Pedro Santos", username: "pedrorun", sex: "M",
    times: { "5k": 21*60+15, "10k": 43*60+30, "21k": 82*60+30 } }, // Rei do 21K!
  
  // ==========================================
  // HOMENS - Competitivo (20-25 min no 5K)
  // ==========================================
  { name: "Lucas Ferreira", username: "lucasf", sex: "M",
    times: { "5k": 21*60+50, "10k": 45*60+15, "21k": 98*60+20 } },
  { name: "Thiago Mendes", username: "thiagom", sex: "M",
    times: { "5k": 22*60+30, "10k": 46*60+45, "21k": 102*60+0 } },
  { name: "André Gomes", username: "andreg", sex: "M",
    times: { "5k": 23*60+15, "10k": 48*60+30, "21k": 105*60+45 } },
  { name: "Felipe Rodrigues", username: "feliper", sex: "M",
    times: { "5k": 24*60+0, "10k": 50*60+20, "21k": 110*60+30 } },
  
  // ==========================================
  // HOMENS - Intermediário (25-30 min no 5K)
  // ==========================================
  { name: "Fernando Lima", username: "fernandol", sex: "M",
    times: { "5k": 25*60+30, "10k": 53*60+0, "21k": 118*60+0 } },
  { name: "João Paulo", username: "jprun", sex: "M",
    times: { "5k": 26*60+45, "10k": 55*60+30, "21k": 122*60+15 } },
  { name: "Ricardo Nunes", username: "ricardon", sex: "M",
    times: { "5k": 27*60+20, "10k": 57*60+15, "21k": 125*60+30 } },
  { name: "Gustavo Almeida", username: "gustavoa", sex: "M",
    times: { "5k": 28*60+50, "10k": 60*60+0, "21k": 132*60+0 } },
  
  // ==========================================
  // HOMENS - Iniciante (30+ min no 5K)
  // ==========================================
  { name: "Marcos Vieira", username: "marcosv", sex: "M",
    times: { "5k": 31*60+15, "10k": 65*60+30, "21k": 145*60+0 } },
  { name: "Daniel Souza", username: "daniels", sex: "M",
    times: { "5k": 33*60+0, "10k": 70*60+45, "21k": 155*60+30 } },

  // ==========================================
  // MULHERES - Elite Amador (Sub-22 no 5K)
  // ==========================================
  { name: "Ana Beatriz", username: "anabrun", sex: "F",
    times: { "5k": 20*60+30, "10k": 43*60+45, "21k": 96*60+15 } }, // Rainha do 5K!
  { name: "Camila Rocha", username: "camilar", sex: "F",
    times: { "5k": 21*60+15, "10k": 44*60+30, "21k": 98*60+0 } },
  { name: "Juliana Martins", username: "julianam", sex: "F",
    times: { "5k": 22*60+0, "10k": 42*60+15, "21k": 95*60+30 } }, // Rainha do 10K!
  
  // ==========================================
  // MULHERES - Competitivo (22-28 min no 5K)
  // ==========================================
  { name: "Patricia Alves", username: "patriciaa", sex: "F",
    times: { "5k": 23*60+30, "10k": 48*60+45, "21k": 105*60+0 } },
  { name: "Fernanda Souza", username: "fernandasouza", sex: "F",
    times: { "5k": 24*60+15, "10k": 50*60+30, "21k": 92*60+45 } }, // Rainha do 21K!
  { name: "Mariana Costa", username: "maric", sex: "F",
    times: { "5k": 25*60+45, "10k": 52*60+15, "21k": 112*60+30 } },
  { name: "Letícia Barbosa", username: "leticiab", sex: "F",
    times: { "5k": 26*60+30, "10k": 54*60+45, "21k": 118*60+0 } },
  
  // ==========================================
  // MULHERES - Intermediário (28-35 min no 5K)
  // ==========================================
  { name: "Isabela Dias", username: "isabelad", sex: "F",
    times: { "5k": 29*60+0, "10k": 62*60+30, "21k": 138*60+15 } },
  { name: "Renata Oliveira", username: "renatao", sex: "F",
    times: { "5k": 31*60+30, "10k": 66*60+0, "21k": 148*60+0 } },
  { name: "Carla Santos", username: "carlas", sex: "F",
    times: { "5k": 33*60+45, "10k": 72*60+15, "21k": 160*60+30 } },
  
  // ==========================================
  // MULHERES - Iniciante (35+ min no 5K)
  // ==========================================
  { name: "Bruna Ferreira", username: "brunaf", sex: "F",
    times: { "5k": 36*60+0, "10k": 78*60+30, "21k": 175*60+0 } },
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
  console.log("👑 Você (Marcelo Jr) é o Rei do 5K com 18:45!")
}

seed().catch(console.error)
