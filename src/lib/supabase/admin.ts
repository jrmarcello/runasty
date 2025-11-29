import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Cliente Supabase admin para uso em callbacks e contextos
 * onde não temos acesso a cookies (ex: NextAuth callbacks)
 * 
 * IMPORTANTE: Este cliente usa SERVICE_ROLE_KEY que bypassa RLS
 * Use apenas em operações server-side seguras
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    // Fallback para ANON_KEY em desenvolvimento (com RLS ativo)
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não definida, usando ANON_KEY')
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )
}
