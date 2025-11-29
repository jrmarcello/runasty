import { Crown } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
}

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-xl",
  xl: "text-3xl",
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div
        className={`${sizes[size]} flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center`}
      >
        <Crown size={iconSizes[size]} className="text-white" />
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-bold ${textSizes[size]} text-gray-900 dark:text-white tracking-tight`}>
          <span className="text-orange-500">Run</span>asty
        </span>
      )}
    </div>
  )
}
