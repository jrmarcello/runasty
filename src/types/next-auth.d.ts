import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      stravaId: number
      accessToken: string
      sex: string | null
    } & DefaultSession["user"]
  }

  interface Profile {
    id: number
    username: string
    firstname: string
    lastname: string
    sex: "M" | "F"
    premium: boolean
    created_at: string
    updated_at: string
    profile: string
    profile_medium: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    stravaId?: number
    sex?: string | null
  }
}
