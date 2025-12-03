"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ConsentModal } from "./consent-modal"

interface ConsentWrapperProps {
  children: React.ReactNode
  userName: string | null
  initialHasConsent: boolean | null
}

/**
 * Wrapper que verifica e solicita consentimento do usuário
 * Exibe o modal se o usuário ainda não deu consentimento
 */
export function ConsentWrapper({ 
  children, 
  userName, 
  initialHasConsent 
}: ConsentWrapperProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [hasConsent, setHasConsent] = useState(initialHasConsent)

  useEffect(() => {
    // Mostrar modal se não tem consentimento (null = novo usuário, false = recusou)
    if (hasConsent !== true) {
      setShowModal(true)
    }
  }, [hasConsent])

  const handleAccept = async () => {
    try {
      const response = await fetch("/api/profile/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar consentimento")
      }

      setHasConsent(true)
      setShowModal(false)
      router.refresh() // Recarregar para atualizar o ranking
    } catch (error) {
      console.error("Erro ao aceitar consentimento:", error)
      alert("Erro ao salvar seu consentimento. Tente novamente.")
    }
  }

  const handleDecline = async () => {
    // Se recusar, faz logout (não pode usar o app sem consentimento)
    try {
      await fetch("/api/profile/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: false }),
      })
    } catch {
      // Ignora erro, vai fazer logout de qualquer forma
    }
    
    // Faz logout e redireciona para login
    signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      <ConsentModal
        isOpen={showModal}
        userName={userName}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
      {/* Mostra o conteúdo com blur se modal estiver aberto */}
      <div className={showModal ? "pointer-events-none select-none" : ""}>
        {children}
      </div>
    </>
  )
}
