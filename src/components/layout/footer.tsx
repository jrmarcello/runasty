"use client"

import { useState } from "react"
import Link from "next/link"
import { Bug, Rocket, Copy, Check, X, Coffee, Zap } from "lucide-react"
import { PoweredByStrava } from "@/components/auth/login-button"

// Configurações PIX - devem ser definidas em .env.local
const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || ""
const PIX_QRCODE = process.env.NEXT_PUBLIC_PIX_QRCODE || ""
const PIX_NAME = process.env.NEXT_PUBLIC_PIX_NAME || "Desenvolvedor"
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "jrmarcello/runasty"

// Verifica se PIX está configurado
const PIX_ENABLED = Boolean(PIX_KEY && PIX_QRCODE)

// Gera URL do QR Code via API pública
function getQRCodeUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
}

export function Footer() {
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const handleReportBug = () => {
    window.open(`https://github.com/${GITHUB_REPO}/issues/new`, "_blank")
  }

  return (
    <>
      {/* Footer */}
      <footer className="mt-8 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
          <button
            onClick={handleReportBug}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2 px-3 -mx-3 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
          >
            <Bug size={16} />
            <span>Reportar bug</span>
          </button>

          <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">·</span>

          {PIX_ENABLED && (
            <button
              onClick={() => setShowDonateModal(true)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-2 px-3 -mx-3 rounded-lg active:bg-orange-50 dark:active:bg-orange-900/20 font-medium"
            >
              <Rocket size={16} className="animate-bounce-slow" />
              <span>Impulsione o projeto</span>
            </button>
          )}
        </div>

        {/* Links legais */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
          <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Privacidade
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Termos
          </Link>
          <span>·</span>
          <Link href="/support" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Suporte
          </Link>
        </div>

        {/* Strava Attribution - Required by Strava API Guidelines */}
        <div className="flex justify-center mt-4">
          <PoweredByStrava />
        </div>
      </footer>

      {/* Donate Modal */}
      {PIX_ENABLED && showDonateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowDonateModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center animate-pulse-slow">
                <Rocket size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Impulsione o Projeto! 🚀
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Ajude a manter o Runasty no ar
              </p>
            </div>

            {/* Fun message */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-4 mb-4 text-center border border-orange-200 dark:border-orange-800/50">
              <p className="text-orange-700 dark:text-orange-200 text-sm">
                Cada PIX é como um <strong>gel de carboidrato</strong> pro projeto!
              </p>
              <p className="text-orange-400 text-xs mt-2 flex items-center justify-center gap-1">
                <Zap size={12} className="text-yellow-500" />
                +10km de energia pra desenvolver
              </p>
              <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
                <Coffee size={12} />
                Ou um cafézinho pós-treino ☕
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getQRCodeUrl(PIX_QRCODE)}
                  alt="QR Code PIX"
                  className="w-40 h-40"
                />
              </div>
            </div>

            {/* PIX Key */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 text-center mb-2">
                Ou copie a chave PIX:
              </p>
              <button
                onClick={handleCopyPix}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl transition-colors"
              >
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {PIX_KEY}
                </span>
                <span className="flex-shrink-0 text-gray-400">
                  {copied ? (
                    <Check size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} />
                  )}
                </span>
              </button>
              {copied && (
                <p className="text-green-400 text-xs text-center mt-2 animate-fade-in">
                  Chave copiada! Valeu demais! 🎉
                </p>
              )}
            </div>

            {/* Recipient info */}
            <p className="text-xs text-gray-500 text-center mb-4">
              Para: <strong className="text-gray-300">{PIX_NAME}</strong>
            </p>

            {/* Close button */}
            <button
              onClick={() => setShowDonateModal(false)}
              className="w-full py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
            >
              <X size={16} />
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
