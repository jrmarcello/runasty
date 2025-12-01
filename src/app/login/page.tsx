import { redirect } from "next/navigation"
import Link from "next/link"
import { Crown } from "lucide-react"
import { auth } from "@/lib/auth"
import { LoginButton } from "@/components/auth/login-button"
import { Logo } from "@/components/ui/logo"

export default async function LoginPage() {
  const session = await auth()

  // Se já estiver logado, redireciona para home
  if (session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white px-6 py-12">
      <div className="text-center max-w-sm w-full space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Logo size="xl" showText={false} className="mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="text-orange-500">Run</span>asty
          </h1>
        </div>

        {/* Descrição */}
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Ranking competitivo de corrida
        </p>

        {/* Slogan */}
        <p className="text-orange-500 dark:text-orange-400 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">
          <Crown size={16} className="text-yellow-500 flex-shrink-0" />
          Conquiste a coroa e defenda sua dinastia!
          <Crown size={16} className="text-yellow-500 flex-shrink-0" />
        </p>

        {/* CTA - Distâncias */}
        <div className="flex justify-center gap-3">
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium">5K</span>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium">10K</span>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium">21K</span>
        </div>

        {/* Botão de Login */}
        <div className="pt-4">
          <LoginButton />
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Conecte sua conta Strava para participar.
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Ao continuar, você concorda com nossa{" "}
            <Link href="/privacy" className="text-orange-500 hover:underline">
              Política de Privacidade
            </Link>{" "}
            e{" "}
            <Link href="/terms" className="text-orange-500 hover:underline">
              Termos de Uso
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
