"use client"

import { useState } from "react"
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
  // Mostrar modal imediatamente se não tem consentimento
  const [showModal, setShowModal] = useState(initialHasConsent !== true)

  // Debug - remover depois
  console.log("[ConsentWrapper] initialHasConsent:", initialHasConsent, "showModal:", initialHasConsent !== true)

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
