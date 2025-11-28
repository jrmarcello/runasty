import NextAuth from "next-auth"
import Strava from "next-auth/providers/strava"
import type { Profile } from "next-auth"
import { createClient } from "@/lib/supabase/server"
import type { ProfileInsert } from "@/types/database"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read,activity:read_all",
        },
      },
      checks: ["state"], // Strava não suporta PKCE, usar apenas state
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Primeira vez que o usuário faz login
      if (account && profile) {
        const stravaProfile = profile as Profile
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.stravaId = stravaProfile.id
        token.sex = stravaProfile.sex || null
      }
      return token
    },
    async session({ session, token }) {
      // Passa dados do token para a sessão
      session.user.id = token.sub!
      session.user.stravaId = token.stravaId as number
      session.user.accessToken = token.accessToken as string
      session.user.sex = (token.sex as string) ?? null
      return session
    },
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false

      try {
        const supabase = await createClient()
        const stravaProfile = profile as Profile
        
        // O ID do Strava vem como número no perfil original
        const stravaId = typeof stravaProfile.id === 'number' 
          ? stravaProfile.id 
          : parseInt(stravaProfile.id as string, 10)
        
        if (isNaN(stravaId)) {
          console.error('Strava ID inválido:', stravaProfile.id)
          return true // Permite login mas não salva
        }
        
        // Dados para upsert
        const profileData: ProfileInsert = {
          strava_id: stravaId,
          username: stravaProfile.username,
          full_name: user.name ?? null,
          avatar_url: user.image ?? null,
          sex: stravaProfile.sex === 'M' ? 'M' : 
               stravaProfile.sex === 'F' ? 'F' : null,
          strava_access_token: account.access_token ?? null,
          strava_refresh_token: account.refresh_token ?? null,
          strava_token_expires_at: account.expires_at 
            ? new Date(account.expires_at * 1000).toISOString() 
            : null,
        }

        // Upsert do perfil no Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert(profileData as never, {
            onConflict: 'strava_id',
          })

        if (error) {
          console.error('Erro ao salvar perfil:', error)
          // Não bloqueia login se falhar salvamento
        }

        return true
      } catch (error) {
        console.error('Erro no callback signIn:', error)
        return true // Permite login mesmo se Supabase falhar
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
})
