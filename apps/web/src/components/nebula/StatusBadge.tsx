import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const StatusBadgeTone = {
  SLATE: 'slate',
  INDIGO: 'indigo',
  VIOLET: 'violet',
  EMERALD: 'emerald',
  EMERALD_SOFT: 'emerald-soft',
  AMBER: 'amber',
  ROSE: 'rose',
  ORANGE: 'orange',
} as const

export type StatusBadgeToneValue = (typeof StatusBadgeTone)[keyof typeof StatusBadgeTone]

const statusBadgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3',
  {
    variants: {
      tone: {
        slate: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
        indigo: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
        violet: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
        emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        'emerald-soft': 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
        amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        orange: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
      } satisfies Record<StatusBadgeToneValue, string>,
    },
    defaultVariants: {
      tone: 'slate',
    },
  },
)

interface StatusBadgeProps {
  tone: StatusBadgeToneValue
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function StatusBadge({ tone, icon: Icon, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>
      {Icon && <Icon aria-hidden />}
      {children}
    </span>
  )
}
