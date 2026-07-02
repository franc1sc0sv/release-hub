import { cn } from '@/lib/utils'

interface PosterFallbackProps {
  className?: string
}

export function PosterFallback({ className }: PosterFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative size-full overflow-hidden rounded-[var(--radius-card)]', className)}
      style={{
        backgroundImage: [
          'radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--brand-indigo-bright) 55%, transparent) 0%, transparent 55%)',
          'radial-gradient(circle at 72% 40%, color-mix(in oklab, var(--brand-magenta) 40%, transparent) 0%, transparent 50%)',
          'radial-gradient(circle at 45% 75%, color-mix(in oklab, var(--brand-violet) 45%, transparent) 0%, transparent 60%)',
          'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--brand-indigo) 60%, transparent) 0%, transparent 70%)',
        ].join(', '),
        filter: 'blur(18px)',
      }}
    />
  )
}
