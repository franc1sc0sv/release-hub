import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { staggerContainer, slideUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { PrCard, type PrItem } from './PrCard'
import { FeatureKindValue } from '../constants/feature-enums'
import type { FeatureItem } from '../hooks/useFeatures'

interface FeatureLaneProps {
  feature: FeatureItem | null
  prs: PrItem[]
  allFeatures: FeatureItem[]
  draggingPr: PrItem | null
  isDropTarget: boolean
  onDragStart: (pr: PrItem) => void
  onDragEnd: (pr: PrItem, point: { x: number; y: number }) => void
  onAssign: (pr: PrItem, featureId: string | null) => void
  assignable: boolean
  onSuggest?: (prId: string) => void
  suggestingPrId?: string | null
}

export function FeatureLane({
  feature,
  prs,
  allFeatures,
  draggingPr,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onAssign,
  assignable,
  onSuggest,
  suggestingPrId,
}: FeatureLaneProps) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()

  const isDefault = feature?.kind === FeatureKindValue.DEFAULT
  const isUnassigned = feature === null
  const prCount = prs.length
  const countLabel = t('board.prCount', { count: prCount })

  const laneId = feature?.id ?? '__unassigned__'

  return (
    <div
      role="region"
      aria-label={feature?.name ?? t('board.unassigned')}
      data-lane-id={laneId}
      className={cn(
        'flex min-w-[240px] max-w-[280px] flex-col gap-3 rounded-[var(--radius-card)] border p-4',
        'backdrop-blur-md transition-all duration-200',
        isUnassigned
          ? 'border-white/8 bg-white/[0.03]'
          : isDefault
            ? 'border-indigo-500/20 bg-indigo-950/30'
            : 'border-white/10 bg-white/5',
        isDropTarget
          ? 'border-brand-magenta/60 bg-brand-magenta/5 shadow-glow-magenta'
          : '',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isDefault && (
              <span className="shrink-0 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-300">
                {enumLabels.featureKind(FeatureKindValue.DEFAULT)}
              </span>
            )}
            <p className="truncate text-sm font-semibold text-foreground">
              {feature?.name ?? t('board.unassigned')}
            </p>
          </div>
          {feature?.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {feature.description}
            </p>
          )}
        </div>
        <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
          {countLabel}
        </span>
      </div>

      {isDropTarget && (
        <div className="flex items-center justify-center rounded-[var(--radius-card)] border border-dashed border-brand-magenta/40 py-2 text-xs text-brand-magenta">
          {t('board.dropHere')}
        </div>
      )}

      <motion.div
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2"
      >
        {prs.map((pr) => (
          <motion.div key={pr.id} variants={reduceMotion ? undefined : slideUp} layout>
            <PrCard
              pr={pr}
              features={allFeatures}
              isDragging={draggingPr?.id === pr.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onAssign={onAssign}
              assignable={assignable}
              onSuggest={onSuggest}
              suggesting={suggestingPrId === pr.id}
            />
          </motion.div>
        ))}

        {prs.length === 0 && !isDropTarget && (
          <p className="py-4 text-center text-xs text-muted-foreground/50">
            {isUnassigned ? t('board.unassignedDescription') : ''}
          </p>
        )}
      </motion.div>
    </div>
  )
}
