"use client"

import { signIn } from "next-auth/react"

export function LoginButton() {
  const handleLogin = () => {
    signIn("strava", { callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleLogin}
      className="group flex items-center justify-center gap-3 w-full bg-[#FC4C02] hover:bg-[#E34402] active:bg-[#D03E02] text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] min-h-[56px]"
    >
      {/* Strava Icon */}
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
