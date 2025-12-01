import { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade | Runasty",
  description: "Política de privacidade do Runasty - Ranking competitivo de corrida com Strava",
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: 1 de dezembro de 2025
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introdução</h2>
            <p>
              O Runasty (&quot;nós&quot;, &quot;nosso&quot; ou &quot;aplicativo&quot;) é um ranking competitivo de corrida 
              que utiliza dados do Strava para criar leaderboards baseados em tempos de corrida. 
              Esta política descreve como coletamos, usamos e protegemos suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Dados que Coletamos</h2>
            <p>Quando você se conecta ao Runasty via Strava, coletamos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Dados do perfil:</strong> Nome, foto de perfil, gênero (para rankings por categoria)</li>
              <li><strong>Dados de atividades:</strong> Apenas corridas, especificamente os melhores tempos (best efforts) para 5K, 10K e meia maratona (21K)</li>
              <li><strong>ID do Strava:</strong> Para identificar sua conta de forma única</li>
            </ul>
            <p className="mt-4">
              <strong>Não coletamos:</strong> GPS detalhado, rotas, localização exata, frequência cardíaca, 
              ou qualquer outro dado sensível além dos tempos de corrida.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Como Usamos seus Dados</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Exibir seu nome e foto no ranking público</li>
              <li>Calcular e exibir sua posição nos rankings de 5K, 10K e 21K</li>
              <li>Separar rankings por gênero (masculino/feminino)</li>
              <li>Calcular tempo como &quot;Rei/Rainha da Montanha&quot; (líder do ranking)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Compartilhamento de Dados</h2>
            <p>
              Os seguintes dados são <strong>públicos</strong> e visíveis para todos os usuários do Runasty:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Seu nome (primeiro nome)</li>
              <li>Sua foto de perfil</li>
              <li>Seus melhores tempos de 5K, 10K e 21K</li>
              <li>Sua posição no ranking</li>
            </ul>
            <p className="mt-4">
              <strong>Não vendemos, alugamos ou compartilhamos</strong> seus dados com terceiros para 
              fins de marketing ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados de forma segura no Supabase (PostgreSQL) com:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Criptografia em repouso</li>
              <li>Políticas de segurança em nível de linha (RLS)</li>
              <li>Acesso restrito apenas aos dados necessários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Acessar:</strong> Ver todos os dados que temos sobre você</li>
              <li><strong>Excluir:</strong> Apagar sua conta e todos os dados associados a qualquer momento através do menu do usuário</li>
              <li><strong>Revogar acesso:</strong> Desconectar o Runasty do Strava em <a href="https://www.strava.com/settings/apps" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">strava.com/settings/apps</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Integração com Strava</h2>
            <p>
              O Runasty utiliza a API oficial do Strava e segue todas as diretrizes da 
              <a href="https://www.strava.com/legal/api" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-1">
                Política de API do Strava
              </a>. Ao conectar sua conta, você autoriza o Runasty a acessar:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><code>read</code> - Dados básicos do perfil</li>
              <li><code>activity:read_all</code> - Atividades para extrair tempos de corrida</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Cookies e Rastreamento</h2>
            <p>
              Utilizamos apenas cookies essenciais para:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Manter sua sessão de login ativa</li>
              <li>Lembrar sua preferência de tema (claro/escuro)</li>
            </ul>
            <p className="mt-4">
              Não utilizamos cookies de terceiros, analytics invasivos ou rastreamento para publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Menores de Idade</h2>
            <p>
              O Runasty não é destinado a menores de 13 anos. Se você é pai/mãe e acredita que seu filho 
              criou uma conta, entre em contato para que possamos excluir os dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Alterações significativas serão 
              comunicadas através do aplicativo. O uso continuado após alterações constitui 
              aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Contato</h2>
            <p>
              Para dúvidas sobre privacidade ou para exercer seus direitos, abra uma issue em nosso 
              <a href="https://github.com/jrmarcello/runasty/issues" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-1">
                repositório no GitHub
              </a>.
            </p>
          </section>

          <hr className="my-8 border-gray-200 dark:border-gray-700" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta política de privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
            e as diretrizes da API do Strava.
          </p>
        </div>
      </div>
    </main>
  )
}
