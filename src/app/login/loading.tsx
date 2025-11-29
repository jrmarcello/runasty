/**
 * Loading state para a página de login
 */

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-pulse">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
            <div className="h-8 w-32 bg-gray-700/50 rounded" />
          </div>
          
          {/* Tagline */}
          <div className="h-4 w-64 bg-gray-700/50 rounded mx-auto" />
        </div>
        
        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="h-6 w-48 bg-gray-700/50 rounded mx-auto mb-2" />
          <div className="h-4 w-56 bg-gray-700/50 rounded mx-auto mb-8" />
          
          {/* Button */}
          <div className="h-12 w-full bg-gray-700/50 rounded-lg" />
        </div>
      </div>
    </main>
  )
}
