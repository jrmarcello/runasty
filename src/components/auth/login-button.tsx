"use client"

import { signIn } from "next-auth/react"
import Image from "next/image"

/**
 * Botão de login com Strava - Versão com imagem oficial
 * Seguindo as Brand Guidelines do Strava:
 * - Usa imagem oficial do botão "Connect with Strava"
 * - Cor laranja oficial (#FC4C02)
 * @see https://developers.strava.com/guidelines/
 */
export function LoginButtonOfficial() {
  const handleLogin = () => {
    signIn("strava", { callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleLogin}
      className="group flex items-center justify-center w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      aria-label="Connect with Strava"
    >
      {/* Imagem oficial do Strava - botão laranja */}
      <Image
        src="/strava/btn_strava_connectwith_orange.svg"
        alt="Connect with Strava"
        width={193}
        height={48}
        className="h-12 w-auto"
        priority
      />
    </button>
  )
}

/**
 * Botão de login com Strava - Versão customizada
 * Seguindo as Brand Guidelines do Strava:
 * - Usa cores oficiais (#FC4C02)
 * - Texto "Connect with Strava" ou "Conectar com Strava"
 * - Ícone oficial do Strava
 * @see https://developers.strava.com/guidelines/
 */
export function LoginButton() {
  const handleLogin = () => {
    signIn("strava", { callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleLogin}
      className="group flex items-center justify-center gap-3 w-full bg-[#FC4C02] hover:bg-[#E34402] active:bg-[#D03E02] text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] min-h-[56px]"
    >
      {/* Strava Icon - Official */}
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 fill-current"
        aria-hidden="true"
      >
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      <span>Conectar com Strava</span>
    </button>
  )
}

/**
 * Badge "Powered by Strava" - Versão com imagem oficial
 * Obrigatório para apps que usam dados do Strava
 * @see https://developers.strava.com/guidelines/
 */
export function PoweredByStravaOfficial({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.strava.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center transition-opacity hover:opacity-80 ${className}`}
      title="Powered by Strava"
    >
      {/* Light mode: gray logo */}
      <Image
        src="/strava/api_logo_pwrdBy_strava_horiz_gray.svg"
        alt="Powered by Strava"
        width={162}
        height={30}
        className="h-6 w-auto dark:hidden"
      />
      {/* Dark mode: orange logo */}
      <Image
        src="/strava/api_logo_pwrdBy_strava_horiz_light.svg"
        alt="Powered by Strava"
        width={162}
        height={30}
        className="h-6 w-auto hidden dark:block"
      />
    </a>
  )
}

/**
 * Badge "Powered by Strava" - Versão customizada
 * Obrigatório para apps que usam dados do Strava
 * @see https://developers.strava.com/guidelines/
 */
export function PoweredByStrava({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://www.strava.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-gray-400 hover:text-[#FC4C02] transition-colors ${className}`}
      title="Powered by Strava"
    >
      <span className="text-xs">Powered by</span>
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        aria-label="Strava"
        fill="currentColor"
      >
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      <span className="text-xs font-semibold">Strava</span>
    </a>
  )
}

/**
 * Link para ver atividade no Strava
 * Formato obrigatório: "View on Strava" ou "Ver no Strava"
 * @see https://developers.strava.com/guidelines/
 */
export function ViewOnStravaLink({ 
  activityId, 
  className = "" 
}: { 
  activityId: number
  className?: string 
}) {
  return (
    <a
      href={`https://www.strava.com/activities/${activityId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[#FC4C02] hover:underline font-medium text-sm ${className}`}
    >
      Ver no Strava
      <svg 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className="w-3.5 h-3.5"
      >
        <path 
          fillRule="evenodd" 
          d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" 
          clipRule="evenodd" 
        />
        <path 
          fillRule="evenodd" 
          d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" 
          clipRule="evenodd" 
        />
      </svg>
    </a>
  )
}
