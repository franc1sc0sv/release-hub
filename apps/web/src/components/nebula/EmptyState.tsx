import type { ReactNode } from 'react'
import { GlassCard } from './GlassCard'
import { CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon: ReactNode
  heading: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, heading, description, action }: EmptyStateProps) {
  return (
    <GlassCard glow="indigo">
      <CardContent className="flex flex-col items-center gap-4 py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-indigo-bright/20">
          {icon}
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-foreground">{heading}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </GlassCard>
  )
}
