import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Cliente Supabase admin para uso em callbacks e contextos
 * onde não temos acesso a cookies (ex: NextAuth callbacks)
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
