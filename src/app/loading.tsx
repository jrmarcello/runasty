/**
 * Loading state para a página principal
 * Next.js usa este componente automaticamente durante navegação
 */

import { HeaderSkeleton, PageSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <HeaderSkeleton />
      <PageSkeleton />
    </main>
  )
}
