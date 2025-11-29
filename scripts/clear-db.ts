import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function clearDb() {
  console.log("🗑️  Limpando banco de dados...")
  
  // Limpar na ordem certa (respeitar foreign keys)
  await supabase.from("ranking_history").delete().neq("strava_id", 0)
  console.log("✅ ranking_history limpo")
  
  await supabase.from("records").delete().neq("strava_id", 0)
  console.log("✅ records limpo")
  
  await supabase.from("profiles").delete().neq("strava_id", 0)
  console.log("✅ profiles limpo")
  
  console.log("\n🎉 Banco limpo!")
}

clearDb().catch(console.error)
