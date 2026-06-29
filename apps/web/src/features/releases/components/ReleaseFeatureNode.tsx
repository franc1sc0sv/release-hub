import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronDown, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PullRequestRow } from './PullRequestRow'
import { ClientAvailabilityLine } from '@/features/features/components/ClientAvailabilityLine'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FEATURE_STATE_BADGE_CLASS } from '@/features/features/constants/feature-enums'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNode = GetReleaseTreeQuery['getReleaseTree']['features'][number]

interface ReleaseFeatureNodeProps {
  node: FeatureNode
  badge?: ReactNode
}

export function ReleaseFeatureNode({ node, badge }: ReleaseFeatureNodeProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()

  const { feature, state, clientAvailabilityKey, flagState, prs } = node
  const prCount = prs.length
  const toggleLabel = open
    ? t('view.feature.collapseLabel', { name: feature.name })
    : t('view.feature.expandLabel', { name: feature.name })

  const prCountLabel = t('view.feature.prCount', { count: prCount })

  return (
    <div className="rounded-[var(--radius-card)] border border-white/12 bg-white/4 backdrop-blur-sm">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/15 mt-0.5">
          <Layers className="size-4 text-indigo-400" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display font-semibold text-foreground">
              {feature.name}
            </span>
            {badge}
            <span className="text-xs text-muted-foreground">{prCountLabel}</span>
          </div>

          <div className="flex flex-col gap-1">
            <Badge
              className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${FEATURE_STATE_BADGE_CLASS[state]}`}
            >
              {enumLabels.featureState(state)}
            </Badge>
            <ClientAvailabilityLine clientAvailabilityKey={clientAvailabilityKey} />
          </div>

          {flagState && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                {t('view.feature.flagState.staging')}{' '}
                <span className={flagState.staging ? 'text-emerald-400' : 'text-rose-400'}>
                  {flagState.staging
                    ? t('view.feature.flagState.on')
                    : t('view.feature.flagState.off')}
                </span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                {t('view.feature.flagState.production')}{' '}
                <span className={flagState.production ? 'text-emerald-400' : 'text-rose-400'}>
                  {flagState.production
                    ? t('view.feature.flagState.on')
                    : t('view.feature.flagState.off')}
                </span>
              </span>
            </div>
          )}

          {feature.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {feature.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-foreground/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-label={toggleLabel}
          onClick={() => setOpen((prev) => !prev)}
          className="mt-1 flex shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && prCount > 0 && (
          <motion.div
            key="prs"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2 border-t border-white/8 px-4 pb-4 pt-3">
              {prs.map((pr) => (
                <PullRequestRow key={pr.id} pr={pr} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
