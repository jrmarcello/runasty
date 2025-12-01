import { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircle, HelpCircle, Shield, Trash2, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "Suporte | Runasty",
  description: "Central de ajuda e suporte do Runasty",
}

export default function SupportPage() {
  const faqs = [
    {
      icon: RefreshCw,
      question: "Meus tempos não estão atualizando",
      answer: "O Runasty sincroniza automaticamente quando você registra novas atividades no Strava. Se os tempos não aparecerem, tente clicar em 'Forçar Sincronização' no menu do usuário. Lembre-se que só contabilizamos corridas com best efforts registrados pelo Strava."
    },
    {
      icon: HelpCircle,
      question: "Por que não vejo meu tempo de meia maratona?",
      answer: "O Strava só registra best efforts quando você corre a distância completa sem pausas longas. Se sua corrida teve pausas ou foi fragmentada, o Strava pode não ter registrado o best effort."
    },
    {
      icon: Shield,
      question: "Quais dados vocês acessam do Strava?",
      answer: "Acessamos apenas: nome, foto de perfil, gênero e os best efforts (melhores tempos) das suas corridas. NÃO acessamos: rotas, GPS, frequência cardíaca ou qualquer dado sensível."
    },
    {
      icon: Trash2,
      question: "Como excluir minha conta?",
      answer: "Você pode excluir sua conta a qualquer momento pelo menu do usuário → 'Encerrar minha conta'. Todos os seus dados serão removidos permanentemente. Você também pode revogar o acesso em: Strava → Configurações → Meus Aplicativos."
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-orange-500">Run</span>
              <span className="text-gray-900 dark:text-white">asty</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Central de Suporte
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tire suas dúvidas ou entre em contato
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-4 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={20} />
            Perguntas Frequentes
          </h2>
          
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <summary className="px-5 py-4 cursor-pointer flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <faq.icon size={20} className="text-orange-500 shrink-0" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {faq.question}
                </span>
              </summary>
              <div className="px-5 pb-4 pt-0 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700">
                <p className="pt-4">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Contato */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Mail size={32} className="mx-auto mb-3 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Entre em contato por email e responderemos o mais rápido possível.
          </p>
          <a
            href="mailto:marcello.dudk@gmail.com?subject=Suporte Runasty"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <Mail size={18} />
            marcello.dudk@gmail.com
          </a>
        </div>

        {/* Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/" className="text-orange-500 hover:underline">
            ← Voltar ao Ranking
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            Privacidade
          </Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            Termos
          </Link>
        </div>
      </div>
    </main>
  )
}
