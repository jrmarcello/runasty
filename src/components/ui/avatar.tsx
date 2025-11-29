"use client"

import Image from "next/image"
import { useState } from "react"

interface AvatarProps {
  src: string | null
  name: string | null
  size?: number
  className?: string
}

/**
 * Componente de Avatar com fallback para iniciais
 */
export function Avatar({ src, name, size = 40, className = "" }: AvatarProps) {
  const [hasError, setHasError] = useState(false)

  const initial = name?.charAt(0)?.toUpperCase() || "?"

  // Se não tem src ou houve erro, mostra iniciais
  if (!src || hasError) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initial}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name || "Avatar"}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
