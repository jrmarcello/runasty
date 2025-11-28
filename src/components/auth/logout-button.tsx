"use client"

import { signOut } from "next-auth/react"

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <button
      onClick={handleLogout}
      className={`text-gray-400 hover:text-white transition-colors ${className}`}
    >
      Sair
    </button>
  )
}
