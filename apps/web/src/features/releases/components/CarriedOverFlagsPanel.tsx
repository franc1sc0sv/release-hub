import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { Link, generatePath, useParams } from 'react-router-dom'
import { History } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { ROUTES } from '@/lib/routes'
import { FlagDeploymentStatusBadge } from '@/features/flags/components/FlagDeploymentStatusBadge'
import { FlagDeploymentStatusValue } from '@/features/flags/constants/flag-enums'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { featureStateTone } from '@/features/features/constants/feature-enums'
import { ReleaseFlagDecisionSelect } from './ReleaseFlagDecisionSelect'
import { CARRIED_OVER_FLAGS } from '../graphql/releases.queries'
import type { CarriedOverFlagsQuery, FlagDeploymentStatus } from '@/generated/graphql'

type CarriedOverFlag = CarriedOverFlagsQuery['carriedOverFlags'][number]

const GROUP_ORDER: FlagDeploymentStatus[] = [
  FlagDeploymentStatusValue.CONFLICT,
  FlagDeploymentStatusValue.IN_PROGRESS,
  FlagDeploymentStatusValue.SHIPPED_OFF,
  FlagDeploymentStatusValue.SHIPPED_ON,
  FlagDeploymentStatusValue.UNTRACKED,
]

interface CarriedOverFlagsPanelProps {
  releaseId: string
}

function CarriedOverFlagRow({ flag, releaseId }: { flag: CarriedOverFlag; releaseId: string }) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-white/8 py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0 flex-1 space-y-1">
        <Link
          to={generatePath(ROUTES.PROJECT_FLAG_DETAIL, {
            organizationId: organizationId ?? '',
            projectId: projectId ?? '',
            flagKey: flag.key,
          })}
          className="font-mono text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {flag.key}
        </Link>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {flag.featureId && flag.featureName && (
            <Link
              to={generatePath(ROUTES.PROJECT_FEATURE_DETAIL, {
                organizationId: organizationId ?? '',
                projectId: projectId ?? '',
                id: flag.featureId,
              })}
              className="underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {flag.featureName}
            </Link>
          )}
          <span>
            {flag.decidedInThisRelease
              ? t('flags.carriedOver.decidedHere')
              : t('flags.carriedOver.origin', { release: flag.originReleaseName })}
          </span>
          {flag.featureReleaseState && (
            <StatusBadge tone={featureStateTone(flag.featureReleaseState)}>
              {enumLabels.featureState(flag.featureReleaseState)}
            </StatusBadge>
          )}
        </div>
      </div>

      <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
        {(canDecide) =>
          canDecide ? (
            <ReleaseFlagDecisionSelect
              releaseId={releaseId}
              trackedFlagId={flag.trackedFlagId}
              decision={flag.decidedInThisRelease ? flag.decision : null}
            />
          ) : null
        }
      </Can>
    </div>
  )
}

export function CarriedOverFlagsPanel({ releaseId }: CarriedOverFlagsPanelProps) {
  const { t } = useTranslation('releases')
  const { data } = useQuery(CARRIED_OVER_FLAGS, {
    variables: { releaseId },
    fetchPolicy: 'cache-and-network',
  })

  const flags = data?.carriedOverFlags ?? []
  if (flags.length === 0) return null

  const groups = GROUP_ORDER.map((status) => ({
    status,
    items: flags.filter((flag) => flag.deploymentStatus === status),
  })).filter((group) => group.items.length > 0)

  return (
    <GlassCard>
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <History className="size-4 text-amber-400" aria-hidden />
          </div>
          <div className="space-y-0.5">
            <p className="font-display text-sm font-semibold text-foreground">
              {t('flags.carriedOver.heading', { count: flags.length })}
            </p>
            <p className="text-xs text-muted-foreground">{t('flags.carriedOver.description')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.status} className="space-y-1">
              <div className="flex items-center gap-2">
                <FlagDeploymentStatusBadge status={group.status} />
                <span className="font-mono text-xs text-muted-foreground">
                  {group.items.length}
                </span>
              </div>
              <div className="pl-1">
                {group.items.map((flag) => (
                  <CarriedOverFlagRow key={flag.trackedFlagId} flag={flag} releaseId={releaseId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  )
}
