/**
 * Componentes de Skeleton para feedback de carregamento
 */

import { CSSProperties } from "react"

// Skeleton base com animação de pulse
function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700/50 rounded ${className}`}
      style={style}
    />
  )
}

// Skeleton para Avatar circular
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

// Skeleton para uma linha de texto
export function TextSkeleton({ width = "100%" }: { width?: string | number }) {
  return (
    <Skeleton
      className="h-4"
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    />
  )
}

// Skeleton para os cards de recorde (Meus Recordes)
export function MyRecordsSkeleton() {
  return (
    <div className="flex justify-center gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
        >
          <Skeleton className="w-8 h-3 mb-1" />
          <Skeleton className="w-14 h-5" />
        </div>
      ))}
    </div>
  )
}

// Skeleton para um card do pódio
function PodiumCardSkeleton({ isKing = false }: { isKing?: boolean }) {
  const size = isKing ? "w-20 h-20 sm:w-24 sm:h-24" : "w-16 h-16 sm:w-20 sm:h-20"
  const pillarHeight = isKing ? "h-28 sm:h-36" : "h-20 sm:h-28"

  return (
    <div className="flex flex-col items-center">
      {/* Avatar */}
      <div className={`${size} rounded-full animate-pulse bg-gray-200 dark:bg-gray-700/50 mb-2`} />
      
      {/* Nome */}
      <Skeleton className="w-16 h-3 mb-2" />
      
      {/* Pilar */}
      <div className={`${pillarHeight} w-20 sm:w-24 rounded-t-lg animate-pulse bg-gray-200 dark:bg-gray-700/30`} />
    </div>
  )
}

// Skeleton para o pódio completo
export function PodiumSkeleton() {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-center items-end gap-2 sm:gap-4">
        {/* 2º lugar */}
        <PodiumCardSkeleton />
        
        {/* 1º lugar */}
        <PodiumCardSkeleton isKing />
        
        {/* 3º lugar */}
        <PodiumCardSkeleton />
      </div>
    </div>
  )
}

// Skeleton para uma linha do ranking
function RankingRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Posição */}
      <Skeleton className="w-6 h-4" />
      
      {/* Avatar */}
      <AvatarSkeleton size={28} />
      
      {/* Nome */}
      <Skeleton className="flex-1 h-4 max-w-[150px]" />
      
      {/* Tempo */}
      <Skeleton className="w-16 h-4" />
    </div>
  )
}

// Skeleton para a tabela de ranking completa
export function RankingTableSkeleton() {
  return (
    <div>
      {/* Pódio */}
      <PodiumSkeleton />
      
      {/* Lista */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {[4, 5, 6, 7, 8].map((i) => (
          <RankingRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Skeleton para a página inteira
export function PageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Meus Recordes */}
      <div className="mb-6">
        <Skeleton className="w-20 h-3 mx-auto mb-2" />
        <MyRecordsSkeleton />
      </div>
      
      {/* Mensagem motivacional */}
      <Skeleton className="w-48 h-4 mx-auto mb-6" />
      
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <Skeleton className="w-40 h-10 mx-auto sm:mx-0" />
        <Skeleton className="w-32 h-10 mx-auto sm:mx-0" />
      </div>
      
      {/* Ranking */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <RankingTableSkeleton />
      </div>
    </div>
  )
}

// Skeleton para header (se necessário)
export function HeaderSkeleton() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded" />
          <Skeleton className="w-20 h-5" />
        </div>
        
        {/* User menu */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </header>
  )
}
