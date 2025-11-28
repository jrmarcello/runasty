import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LoginButton } from "@/components/auth/login-button"

export default async function LoginPage() {
  const session = await auth()

  // Se já estiver logado, redireciona para home
  if (session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="text-center max-w-md px-6">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-orange-500">Run</span>asty
          </h1>
          <p className="text-gray-400 text-lg">
            🏆 Ranking Competitivo de Corrida
          </p>
        </div>

        {/* Descrição */}
        <div className="mb-10 space-y-4">
          <p className="text-gray-300">
            Compare seus melhores tempos de corrida com outros atletas.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <span className="bg-gray-700 px-3 py-1 rounded-full">5K</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full">10K</span>
            <span className="bg-gray-700 px-3 py-1 rounded-full">21K</span>
          </div>
          <p className="text-orange-400 font-medium">
            👑 Conquiste o título de Rei/Rainha da Montanha!
          </p>
        </div>

        {/* Botão de Login */}
        <LoginButton />

        {/* Info */}
        <p className="mt-6 text-xs text-gray-500">
          Conectamos com sua conta Strava para sincronizar seus melhores tempos automaticamente.
        </p>
      </div>
    </div>
  )
}
