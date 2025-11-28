import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Teste de conexão - busca a sessão atual
  const { data: { user }, error } = await supabase.auth.getUser()

  const connectionStatus = error?.message?.includes('Invalid API key') 
    ? '❌ Chaves do Supabase não configuradas'
    : error 
      ? `⚠️ Erro: ${error.message}`
      : '✅ Conectado ao Supabase'

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🏃‍♂️ Runasty</h1>
        <p className="text-gray-600 mb-6">Ranking de Recordes Pessoais</p>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Status da Conexão</p>
          <p className="font-medium">{connectionStatus}</p>
        </div>

        {user ? (
          <div className="bg-green-100 rounded-lg p-4">
            <p className="text-green-800">Logado como: {user.email}</p>
          </div>
        ) : (
          <button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            disabled
          >
            Entrar com Strava (em breve)
          </button>
        )}

        <p className="text-xs text-gray-400 mt-6">
          Milestone 1 - Issue #1 ✅
        </p>
      </div>
    </main>
  )
}
