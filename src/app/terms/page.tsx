import { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Uso | Runasty",
  description: "Termos de uso do Runasty - Ranking competitivo de corrida com Strava",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Header simples */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" showText />
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Termos de Uso</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: 1 de dezembro de 2025
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Runasty, você concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deve usar o aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Descrição do Serviço</h2>
            <p>
              O Runasty é um aplicativo gratuito de ranking competitivo de corrida que:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Sincroniza seus melhores tempos de corrida do Strava</li>
              <li>Cria rankings públicos para distâncias de 5K, 10K e 21K</li>
              <li>Permite competição amigável entre corredores</li>
              <li>Destaca o líder de cada distância como &quot;Rei/Rainha da Montanha&quot;</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Conta e Autenticação</h2>
            <p>
              Para usar o Runasty, você deve:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Ter uma conta válida no Strava</li>
              <li>Autorizar o Runasty a acessar seus dados de atividades</li>
              <li>Manter suas credenciais do Strava seguras</li>
            </ul>
            <p className="mt-4">
              Você é responsável por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Uso Aceitável</h2>
            <p>Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Manipular ou falsificar dados de atividades</li>
              <li>Usar bots ou automação para criar vantagens injustas</li>
              <li>Tentar acessar dados de outros usuários de forma não autorizada</li>
              <li>Usar o serviço para qualquer finalidade ilegal</li>
              <li>Interferir no funcionamento normal do aplicativo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Dados Públicos</h2>
            <p>
              Ao usar o Runasty, você entende e aceita que os seguintes dados serão 
              <strong> públicos e visíveis</strong> para todos os usuários:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Seu primeiro nome</li>
              <li>Sua foto de perfil do Strava</li>
              <li>Seus melhores tempos de corrida</li>
              <li>Sua posição no ranking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Propriedade Intelectual</h2>
            <p>
              O Runasty é um projeto open source disponível no GitHub. O código fonte está 
              licenciado sob os termos especificados no repositório. A marca Runasty, 
              logo e design visual são de propriedade do projeto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              O Runasty é fornecido &quot;como está&quot;, sem garantias de qualquer tipo. Não nos 
              responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Interrupções ou indisponibilidade do serviço</li>
              <li>Perda de dados ou posições no ranking</li>
              <li>Erros na sincronização com o Strava</li>
              <li>Danos indiretos ou consequenciais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Integração com Strava</h2>
            <p>
              O Runasty depende da API do Strava. Mudanças na API, políticas ou 
              disponibilidade do Strava podem afetar o funcionamento do aplicativo. 
              Não temos controle sobre esses fatores externos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Encerramento de Conta</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento através do menu do usuário. 
              Ao encerrar:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Todos os seus dados serão permanentemente excluídos</li>
              <li>Suas posições no ranking serão removidas</li>
              <li>Esta ação é irreversível</li>
            </ul>
            <p className="mt-4">
              Reservamos o direito de suspender ou encerrar contas que violem estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Alterações nos Termos</h2>
            <p>
              Podemos modificar estes termos a qualquer momento. Alterações significativas 
              serão comunicadas através do aplicativo. O uso continuado após alterações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis do Brasil. Qualquer disputa será 
              resolvida nos tribunais competentes do Brasil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, abra uma issue em nosso 
              <a href="https://github.com/jrmarcello/runasty/issues" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-1">
                repositório no GitHub
              </a>.
            </p>
          </section>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ao usar o Runasty, você também concorda com nossa{" "}
            <Link href="/privacy" className="text-orange-500 hover:underline">
              Política de Privacidade
            </Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
