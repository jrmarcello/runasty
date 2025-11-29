"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

const themes = [
  { key: "light", label: "Claro", icon: Sun },
  { key: "dark", label: "Escuro", icon: Moon },
  { key: "system", label: "Sistema", icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch - usar callback para evitar warning do lint
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <div className="w-8 h-8 rounded-md bg-gray-300 dark:bg-gray-600 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 gap-1">
      {themes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`p-2 rounded-md transition-all ${
            theme === key
              ? "bg-white dark:bg-gray-600 text-orange-500 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
          title={label}
          aria-label={`Tema ${label}`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}

// Versão dropdown para usar no menu do usuário
export function ThemeDropdown() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tema</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-7 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  return (
    <div className="px-4 py-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tema</p>
      <div className="flex gap-1">
        {themes.map(({ key, label, icon: Icon }) => {
          const isActive = theme === key || (key === "system" && theme === "system")
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleThemeChange(key)
              }}
              className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title={label}
              aria-label={`Tema ${label}`}
            >
              <Icon size={16} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
