import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CheckCircle2, CircleDashed, Loader2, RadarIcon } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { GradientButton } from '@/components/nebula/GradientButton'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { releaseFlagDecisionTone } from '@/features/releases/constants/release-enums'
import { deriveFlagLifecycleStatus } from '../lib/flag-lifecycle'
import type { TrackedFlagQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<TrackedFlagQuery['trackedFlag']>

interface FlagStatusHeroProps {
  flag: TrackedFlagDetail
  onRescan: () => void
  rescanning: boolean
}

export function FlagStatusHero({ flag, onRescan, rescanning }: FlagStatusHeroProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()

  const lifecycle = deriveFlagLifecycleStatus(flag.releases)
  const isShippedSomewhere = flag.delivery.shippedReleaseVersions.length > 0

  return (
    <GlassCard glow="indigo">
      <CardContent className="space-y-5 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <p className="text-overline uppercase tracking-widest text-muted-foreground">
              {t('detail.overline')}
            </p>
            <h1 className="break-words font-mono text-display-lg font-bold tracking-tight text-foreground">
              {flag.key}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={releaseFlagDecisionTone(lifecycle.decision)}>
                {enumLabels.releaseFlagDecision(lifecycle.decision)}
              </StatusBadge>
              <StatusBadge
                tone={flag.presentInCode ? 'emerald' : 'slate'}
                icon={flag.presentInCode ? CheckCircle2 : CircleDashed}
              >
                {flag.presentInCode
                  ? t('detail.currentStatus.presentInCode')
                  : t('detail.currentStatus.notPresentInCode')}
              </StatusBadge>
              <StatusBadge tone={isShippedSomewhere ? 'emerald-soft' : 'slate'}>
                {isShippedSomewhere
                  ? t('detail.currentStatus.live')
                  : t('detail.currentStatus.notLive')}
              </StatusBadge>
            </div>
          </div>

          <Can I={Action.UPDATE} a={Subject.PROJECT}>
            <GradientButton disabled={rescanning} onClick={onRescan}>
              {rescanning ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RadarIcon className="size-4" aria-hidden />
              )}
              {t('detail.coverage.button')}
            </GradientButton>
          </Can>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-[140px_1fr]">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('detail.currentStatus.delivery.label')}
          </p>
          {flag.delivery.shippedReleaseVersions.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">
              {t('detail.currentStatus.delivery.notShipped')}
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-foreground">
                {t('detail.currentStatus.delivery.shippedIn', {
                  version: flag.delivery.shippedReleaseVersions.join(', '),
                })}
              </span>
              {flag.delivery.inDefaultBranch && (
                <StatusBadge tone="indigo">
                  {t('detail.currentStatus.delivery.inDefaultBranch')}
                </StatusBadge>
              )}
            </div>
          )}

          {lifecycle.release && (
            <>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('detail.currentStatus.decidedIn')}
              </p>
              <Link
                to={{
                  pathname: ROUTES.RELEASE_DETAIL.replace(':releaseId', lifecycle.release.releaseId),
                  search: '?section=flags',
                }}
                className="w-fit font-mono text-sm text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {lifecycle.release.version}
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </GlassCard>
  )
}
