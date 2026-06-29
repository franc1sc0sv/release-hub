import type { ComponentProps } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GlassCardProps extends ComponentProps<typeof Card> {
  glow?: 'none' | 'indigo' | 'magenta'
}

const glowMap: Record<NonNullable<GlassCardProps['glow']>, string> = {
  none: '',
  indigo: 'shadow-glow-indigo',
  magenta: 'shadow-glow-magenta',
}

export function GlassCard({ glow = 'none', className, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        'glass rounded-[var(--radius-card)] border-border/60',
        'transition-shadow duration-300',
        glowMap[glow],
        className,
      )}
      {...props}
    />
  )
}
