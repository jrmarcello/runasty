"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Registrar service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Service Worker registrado:", registration.scope)
          }

          // Verificar por updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Nova versão disponível - pode mostrar toast no futuro
                }
              })
            }
          })
        })
        .catch((error) => {
          // Manter log de erro para debug
          console.error("❌ Erro ao registrar Service Worker:", error)
        })
    }
  }, [])

  return null
}
