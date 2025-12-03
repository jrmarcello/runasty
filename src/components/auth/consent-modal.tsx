"use client"

import { useState } from "react"
import { Shield, Users, Trophy, ExternalLink } from "lucide-react"

interface ConsentModalProps {
  isOpen: boolean
  userName: string | null
  onAccept: () => Promise<void>
  onDecline: () => void
}

/**
 * Modal de Consentimento Explícito
 * Conforme exigido pelo Contrato da API Strava:
 * "não compartilhar dados de um usuário do Strava com outros usuários... sem consentimento explícito"
 * @see https://www.strava.com/legal/api
 */
export function ConsentModal({ isOpen, userName, onAccept, onDecline }: ConsentModalProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleAccept = async () => {
    if (!isChecked) return
    setIsLoading(true)
    try {
      await onAccept()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Bem-vindo ao Runasty!
              </h2>
              <p className="text-orange-100 text-sm">
                {userName ? `Olá, ${userName.split(' ')[0]}!` : 'Precisamos do seu consentimento'}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-5">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-5">
            O Runasty é um <strong>ranking comunitário</strong> onde corredores competem pelos melhores tempos. 
            Para participar, precisamos do seu consentimento explícito para compartilhar seus dados.
          </p>

          {/* O que será compartilhado */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              O que será visível para outros usuários:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Users className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Seu nome e foto de perfil</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Trophy className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Seus melhores tempos (5K, 10K, 21K)</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Trophy className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Sua posição no ranking público</span>
              </li>
            </ul>
          </div>

          {/* Checkbox de consentimento */}
          <label className="flex items-start gap-3 cursor-pointer group mb-5">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center group-hover:border-orange-400">
                {isChecked && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
              Eu autorizo o Runasty a exibir meu nome, foto e tempos de corrida no <strong>ranking público</strong> para outros usuários do app.
            </span>
          </label>

          {/* Links para políticas */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-5">
            <a 
              href="/privacy" 
              target="_blank"
              className="hover:text-orange-500 transition-colors inline-flex items-center gap-1"
            >
              Política de Privacidade
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a 
              href="/terms" 
              target="_blank"
              className="hover:text-orange-500 transition-colors inline-flex items-center gap-1"
            >
              Termos de Serviço
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a 
              href="https://www.strava.com/legal/api" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition-colors inline-flex items-center gap-1"
            >
              Contrato API Strava
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Não aceito
            </button>
            <button
              onClick={handleAccept}
              disabled={!isChecked || isLoading}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                'Aceitar e continuar'
              )}
            </button>
          </div>
        </div>

        {/* Nota de compliance */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Em conformidade com o Contrato da API Strava e LGPD. 
            Seus dados são usados apenas para o ranking e você pode remover seu consentimento a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  )
}
