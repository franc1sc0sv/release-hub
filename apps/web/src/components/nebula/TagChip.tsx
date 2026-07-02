import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagChipProps {
  children: ReactNode
  onRemove?: () => void
  removeLabel?: string
  className?: string
}

export function TagChip({ children, onRemove, removeLabel, className }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs font-medium text-foreground/70',
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="flex size-3.5 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="size-2.5" aria-hidden />
        </button>
      )}
    </span>
  )
}
