import { Crown, Timer, Flame, Trophy, Heart, Activity } from "lucide-react"

// Re-export ícones do Lucide que usamos
export { Crown, Timer, Flame, Trophy, Heart, Activity }

// Logo do Runasty - ícone customizado
export function RunastyLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Runner silhouette stylized */}
      <circle cx="16" cy="16" r="15" fill="url(#gradient)" />
      <path
        d="M12 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6.5 4.8l-3.2 3.2-1.5-1.5c-.4-.4-1-.4-1.4 0l-3.2 3.2c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l2.5-2.5 1.5 1.5c.4.4 1 .4 1.4 0l3.9-3.9c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0z"
        fill="white"
        transform="translate(4, 4) scale(0.8)"
      />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui"
      >
        RN
      </text>
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Ícone de corredor minimalista
export function RunnerIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <Activity size={size} className={className} />
  )
}
