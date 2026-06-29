import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NebulaBackgroundProps {
  children: ReactNode
  className?: string
}

export function NebulaBackground({ children, className }: NebulaBackgroundProps) {
  return (
    <div className={cn('relative min-h-full bg-background', className)}>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
