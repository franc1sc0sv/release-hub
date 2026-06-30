import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import {
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
} from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { GET_COVERAGE } from '../graphql/releases.queries'
import { ReleaseStatusValue } from '../constants/release-enums'

interface CoverageMeterProps {
  releaseId: string
  releaseStatus: string
}

export function CoverageMeter({ releaseId, releaseStatus }: CoverageMeterProps) {
  const { t } = useTranslation('releases')
  const shouldReduceMotion = useReducedMotion()

  const { data, loading } = useQuery(GET_COVERAGE, {
    variables: { releaseId },
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data) {
    return null
  }

  const coverage = data?.getCoverage
  if (!coverage) return null

  const { total, assigned, ready } = coverage
  const percent = total === 0 ? 0 : Math.round((assigned / total) * 100)

  const isDraft = releaseStatus === ReleaseStatusValue.DRAFT
  const isConfirmed =
    releaseStatus === ReleaseStatusValue.READY_TO_RELEASE ||
    releaseStatus === ReleaseStatusValue.MERGED ||
    releaseStatus === ReleaseStatusValue.DEPLOYED

  const statusColor = isDraft
    ? 'var(--color-indigo-400)'
    : ready && isConfirmed
      ? 'var(--status-live)'
      : 'var(--status-mismatch)'

  const transitionDuration = shouldReduceMotion ? 0 : 0.6

  return (
    <GlassCard>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base font-semibold text-foreground">
          {t('coverage.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProgressPrimitive.Root
          value={percent}
          data-slot="progress"
          className="flex flex-wrap gap-3"
          aria-label={t('coverage.title')}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <ProgressLabel className="sr-only">{t('coverage.title')}</ProgressLabel>
          <ProgressTrack>
            <ProgressIndicator
              className={cn('transition-all', shouldReduceMotion ? '' : 'duration-600')}
              style={{
                backgroundColor: statusColor,
                transition: shouldReduceMotion
                  ? 'none'
                  : `background-color ${transitionDuration}s ease, width ${transitionDuration}s cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            />
          </ProgressTrack>
        </ProgressPrimitive.Root>

        <div className="flex items-center justify-between">
          <motion.span
            key={`${assigned}-${total}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-sm tabular-nums"
            style={{ color: statusColor }}
          >
            {t('coverage.assignedOf', { assigned, total })}
          </motion.span>

          <motion.div
            key={`${String(isDraft)}-${String(ready)}`}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: statusColor }}
          >
            {isDraft ? (
              <>
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {t('coverage.inReview')}
              </>
            ) : ready ? (
              <>
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {t('coverage.ready')}
              </>
            ) : (
              <>
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {t('coverage.incomplete')}
              </>
            )}
          </motion.div>
        </div>
      </CardContent>
    </GlassCard>
  )
}
