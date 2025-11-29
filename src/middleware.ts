import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Rate limiting simples por IP para APIs
// Em produção, considere usar Vercel KV ou Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 30 // 30 requests por minuto

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Limpar entries antigas periodicamente
    if (rateLimitMap.size > 10000) {
      const threshold = now - RATE_LIMIT_WINDOW_MS
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.resetTime < threshold) {
          rateLimitMap.delete(key)
        }
      }
    }
    
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  record.count++
  
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  return false
}

export async function middleware(request: NextRequest) {
  // Rate limiting apenas para rotas de API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Excluir webhook do Strava do rate limit (Strava controla seus próprios limites)
    const isWebhook = request.nextUrl.pathname === '/api/strava/webhook'
    
    if (!isWebhook && isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
        { status: 429 }
      )
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
