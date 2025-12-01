"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { ThemeDropdown } from "@/components/ui/theme-toggle"
import { Trash2, AlertTriangle, X, TrendingUp } from "lucide-react"

// Formata tempo relativo
function formatTimeAgo(date: Date | null): string {
  if (!date) return ""
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  
  if (diffSecs < 60) return "agora"
  if (diffMins < 60) return `há ${diffMins}min`
  if (diffHours < 24) return `há ${diffHours}h`
  return `há ${Math.floor(diffHours / 24)}d`
}

interface UserLevel {
  level: string
  emoji: string
  description: string
}

interface UserMenuProps {
  user: {
    name?: string | null
    image?: string | null
  }
  onSync: () => void
  isSyncing: boolean
  lastSyncAt?: Date | null
}

export function UserMenu({ user, onSync, isSyncing, lastSyncAt }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Buscar nível do usuário (e rebuscar após sync)
  useEffect(() => {
    // Não buscar durante sync
    if (isSyncing) return

    async function fetchLevel() {
      try {
        const response = await fetch("/api/profile/level")
        if (response.ok) {
          const data = await response.json()
          setUserLevel(data)
        }
      } catch {
        // Silently fail
      }
    }
    fetchLevel()
  }, [isSyncing]) // Rebusca quando sync termina

  const initial = user.name?.charAt(0)?.toUpperCase() || "?"

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao encerrar conta")
      }

      // Desloga o usuário após deletar a conta
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Erro ao encerrar conta")
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Avatar"}
              width={36}
              height={36}
              className="rounded-full object-cover aspect-square"
              style={{ width: 36, height: 36 }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
          )}
          {/* Indicador de sincronização no avatar */}
          {isSyncing && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
        </div>
        {/* Nome e nível do usuário - sempre visível */}
        <div className="flex flex-col items-start">
          <span className="text-sm text-gray-600 dark:text-gray-300">{user.name?.split(" ")[0]}</span>
          {isSyncing ? (
            <span className="text-[10px] text-orange-500 font-medium flex items-center gap-1">
              <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sincronizando...
            </span>
          ) : userLevel ? (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              {userLevel.emoji} {userLevel.level}
            </span>
          ) : null}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
            {/* Badge de última sincronização */}
            {lastSyncAt && !isSyncing && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Sincronizado {formatTimeAgo(lastSyncAt)}
                </span>
              </div>
            )}
            {isSyncing && (
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3 h-3 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-orange-500 font-medium">Sincronizando...</span>
              </div>
            )}
          </div>

          {/* Sincronizar */}
          <button
            onClick={() => {
              onSync()
              setIsOpen(false)
            }}
            disabled={isSyncing}
            className="w-full px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 hover:text-gray-900 dark:hover:text-white flex items-center gap-3 disabled:opacity-50 transition-colors"
            >
              <svg
                className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            {isSyncing ? "Sincronizando..." : "Forçar Sincronização"}
          </button>

          {/* Meu Perfil / Insights */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 hover:text-gray-900 dark:hover:text-white flex items-center gap-3 transition-colors"
          >
            <TrendingUp size={20} />
            Meus Insights
          </Link>

          {/* Seletor de Tema */}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <ThemeDropdown />
          </div>

          {/* Sair */}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 hover:text-gray-900 dark:hover:text-white flex items-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </button>
          </div>

          {/* Encerrar Conta */}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                setShowDeleteModal(true)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Encerrar minha conta
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão - Renderizado via Portal */}
      {showDeleteModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Encerrar conta</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteError(null)
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Tem certeza que deseja encerrar sua conta? Esta ação é <strong>irreversível</strong> e todos os seus dados serão permanentemente excluídos:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                <li>• Seus recordes pessoais</li>
                <li>• Histórico de ranking</li>
                <li>• Perfil do Runasty</li>
              </ul>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {deleteError}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteError(null)
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  "Sim, encerrar"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
