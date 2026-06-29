import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, type PanInfo } from 'motion/react'
import { GitMerge, Loader2, Sparkles } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DiffRefsQuery } from '@/generated/graphql'
import type { FeatureItem } from '../hooks/useFeatures'

export type PrItem = DiffRefsQuery['diffRefs'][number]

interface PrCardProps {
  pr: PrItem
  features: FeatureItem[]
  isDragging?: boolean
  onDragStart?: (pr: PrItem) => void
  onDragEnd?: (pr: PrItem, point: { x: number; y: number }) => void
  onAssign: (pr: PrItem, featureId: string | null) => void
  assignable: boolean
  onSuggest?: (prId: string) => void
  suggesting?: boolean
}

export function PrCard({
  pr,
  features,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onAssign,
  assignable,
  onSuggest,
  suggesting = false,
}: PrCardProps) {
  const { t } = useTranslation('features')
  const reduceMotion = useReducedMotion()

  const currentFeature = features.find((f) => f.id === pr.featureId) ?? null

  const dragProps =
    assignable && !reduceMotion
      ? {
          drag: true as const,
          dragSnapToOrigin: true,
          dragElastic: 0.12,
          whileDrag: {
            scale: 1.05,
            zIndex: 50,
            boxShadow: '0 0 0 2px var(--brand-magenta)',
          },
          onDragStart: () => onDragStart?.(pr),
          onDragEnd: (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            onDragEnd?.(pr, { x: info.point.x, y: info.point.y })
          },
        }
      : {}

  return (
    <motion.div
      {...dragProps}
      className={[
        'flex items-center gap-3 rounded-full border border-white/10 bg-white/5',
        'px-3 py-2 backdrop-blur-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
        assignable && !reduceMotion ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
        assignable ? 'hover:border-white/20' : 'opacity-70',
        isDragging ? 'opacity-40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ touchAction: 'none' }}
    >
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
        <GitMerge className="size-3 text-indigo-400" aria-hidden="true" />
      </div>

      <span className="font-mono text-xs text-muted-foreground">#{pr.number}</span>

      <p className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
        {pr.title}
      </p>

      {onSuggest && assignable && (
        <button
          type="button"
          onClick={() => onSuggest(pr.id)}
          disabled={suggesting}
          aria-label={t('prCard.suggestAriaLabel', { number: pr.number })}
          className="flex shrink-0 items-center justify-center rounded-[var(--radius-button)] p-1 text-indigo-400 transition-colors hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {suggesting ? (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-3" aria-hidden />
          )}
        </button>
      )}

      {assignable && (
        <Select
          value={pr.featureId ?? '__unassigned__'}
          onValueChange={(val) => {
            const featureId = val === '__unassigned__' ? null : val
            onAssign(pr, featureId)
          }}
        >
          <SelectTrigger
            size="sm"
            className="h-6 w-auto max-w-[120px] shrink-0 border-white/20 bg-white/5 text-xs"
            aria-label={t('prCard.assignTo')}
          >
            <SelectValue>
              <span className="truncate">
                {currentFeature ? currentFeature.name : t('prCard.unassigned')}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__unassigned__">{t('prCard.unassigned')}</SelectItem>
            {features.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </motion.div>
  )
}
