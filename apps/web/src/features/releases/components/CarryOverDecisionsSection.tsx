import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { Link, generatePath, useParams } from 'react-router-dom'
import { CheckCircle2, History } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { ROUTES } from '@/lib/routes'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FlagDeploymentStatusBadge } from '@/features/flags/components/FlagDeploymentStatusBadge'
import { FlagDeploymentStatusValue } from '@/features/flags/constants/flag-enums'
import { featureStateTone } from '@/features/features/constants/feature-enums'
import { FlagDecisionControl } from './FlagDecisionControl'
import { ReleaseSectionHeading } from './ReleaseSectionHeading'
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

interface CarryOverRowProps {
  flag: CarriedOverFlag
  releaseId: string
}

function CarryOverRow({ flag, releaseId }: CarryOverRowProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/6 px-5 py-3 first:border-t-0">
      <div className="min-w-0 flex-1 space-y-1">
        <Link
          to={generatePath(ROUTES.PROJECT_FLAG_DETAIL, {
            organizationId: organizationId ?? '',
            projectId: projectId ?? '',
            flagKey: flag.key,
          })}
          className="break-all font-mono text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          {!flag.decidedInThisRelease && <span>{t('flags.carriedOver.origin', { release: flag.originReleaseName })}</span>}
          {flag.featureReleaseState && (
            <StatusBadge tone={featureStateTone(flag.featureReleaseState)}>
              {enumLabels.featureState(flag.featureReleaseState)}
            </StatusBadge>
          )}
        </div>
      </div>

      <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
        {(canDecide) => (
          <FlagDecisionControl
            releaseId={releaseId}
            trackedFlagId={flag.trackedFlagId}
            flagKey={flag.key}
            decision={flag.decidedInThisRelease ? flag.decision : null}
            canDecide={canDecide}
          />
        )}
      </Can>
    </li>
  )
}

interface CarryOverGroupProps {
  status: FlagDeploymentStatus
  flags: CarriedOverFlag[]
  releaseId: string
}

function CarryOverGroup({ status, flags, releaseId }: CarryOverGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 border-t border-white/8 bg-white/[0.02] px-5 py-2.5 first:border-t-0">
        <FlagDeploymentStatusBadge status={status} />
        <span className="font-mono text-xs text-muted-foreground">{flags.length}</span>
      </div>
      <ul>
        {flags.map((flag) => (
          <CarryOverRow key={flag.trackedFlagId} flag={flag} releaseId={releaseId} />
        ))}
      </ul>
    </div>
  )
}

function groupByStatus(flags: CarriedOverFlag[]) {
  return GROUP_ORDER.map((status) => ({
    status,
    items: flags.filter((flag) => flag.deploymentStatus === status),
  })).filter((group) => group.items.length > 0)
}

interface CarryOverDecisionsSectionProps {
  releaseId: string
}

export function CarryOverDecisionsSection({ releaseId }: CarryOverDecisionsSectionProps) {
  const { t } = useTranslation('releases')
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const { data, loading } = useQuery(CARRIED_OVER_FLAGS, {
    variables: { releaseId },
    fetchPolicy: 'cache-and-network',
  })

  const flags = data?.carriedOverFlags ?? []
  const open = flags.filter((flag) => !flag.decidedInThisRelease)
  const decided = flags.filter((flag) => flag.decidedInThisRelease)

  return (
    <section aria-labelledby="release-carry-over-heading" className="space-y-5">
      <ReleaseSectionHeading
        id="release-carry-over-heading"
        title={t('workspace.sections.carryOver')}
        description={
          <>
            {t('workspace.carryOver.description')}{' '}
            <Link
              to={generatePath(ROUTES.PROJECT_FLAGS, { organizationId: organizationId ?? '', projectId: projectId ?? '' })}
              className="text-foreground underline underline-offset-2 hover:text-foreground/80"
            >
              {t('workspace.carryOver.flagsPageLink')}
            </Link>
          </>
        }
        actions={open.length > 0 && <StatusBadge tone={StatusBadgeTone.AMBER}>{t('workspace.carryOver.openCount', { count: open.length })}</StatusBadge>}
      />

      {!loading && flags.length === 0 && (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CheckCircle2 className="size-7 text-emerald-400" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('workspace.carryOver.empty')}</p>
          </CardContent>
        </GlassCard>
      )}

      {open.length > 0 && (
        <GlassCard className="overflow-hidden border-amber-500/25">
          <div className="flex items-center gap-2 border-b border-white/8 bg-amber-500/5 px-5 py-3">
            <History className="size-4 text-amber-400" aria-hidden />
            <p className="text-sm font-medium text-foreground">{t('workspace.carryOver.needsDecision')}</p>
          </div>
          {groupByStatus(open).map((group) => (
            <CarryOverGroup key={group.status} status={group.status} flags={group.items} releaseId={releaseId} />
          ))}
        </GlassCard>
      )}

      {decided.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
            <CheckCircle2 className="size-4 text-emerald-400" aria-hidden />
            <p className="text-sm font-medium text-foreground">{t('workspace.carryOver.decidedHere')}</p>
            <span className="font-mono text-xs text-muted-foreground">{decided.length}</span>
          </div>
          {groupByStatus(decided).map((group) => (
            <CarryOverGroup key={group.status} status={group.status} flags={group.items} releaseId={releaseId} />
          ))}
        </GlassCard>
      )}
    </section>
  )
}
