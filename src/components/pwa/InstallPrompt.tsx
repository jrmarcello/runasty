"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Share, Plus, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true) // Default true to prevent flash

  const checkShouldShow = useCallback(() => {
    // Verificar se já foi dismissado recentemente
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return false
    }
    return true
  }, [])

  useEffect(() => {
    // Detectar plataforma
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    // Atualizar estados de forma assíncrona para evitar warning
    const timer = setTimeout(() => {
      setIsStandalone(standalone)
      setIsIOS(ios)
    }, 0)

    if (standalone || !checkShouldShow()) {
      return () => clearTimeout(timer)
    }

    // Listener para Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Para iOS, mostrar instruções após alguns segundos
    let iosTimeout: NodeJS.Timeout | undefined
    if (ios) {
      iosTimeout = setTimeout(() => setShowPrompt(true), 5000)
    }

    return () => {
      clearTimeout(timer)
      if (iosTimeout) clearTimeout(iosTimeout)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [checkShouldShow])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString())
  }

  if (!showPrompt || isStandalone) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">👑</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Instalar Runasty</h3>
            
            {isIOS ? (
              // Instruções para iOS
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <p className="flex items-center gap-1">
                  Toque em <Share className="w-4 h-4 inline text-blue-400" /> e depois
                </p>
                <p className="flex items-center gap-1 mt-1">
                  <Plus className="w-4 h-4 inline text-gray-400 dark:text-gray-300" /> &quot;Adicionar à Tela Inicial&quot;
                </p>
              </div>
            ) : (
              // Botão para Android/Desktop
              <>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Acesse rapidamente direto da sua tela inicial
                </p>
                <button
                  onClick={handleInstall}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Instalar App
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
