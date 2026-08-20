import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { EnvStateCell } from '@/features/flags/components/EnvStateCell'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { ReleaseFlagDecisionSelect } from './ReleaseFlagDecisionSelect'
import { FlagFeatureStateSuggestion } from './FlagFeatureStateSuggestion'
import { FlagPrLinkChip } from './FlagPrLinkChip'
import type { ReleaseFlagsQuery } from '@/generated/graphql'

type ReleaseFlagRowData = ReleaseFlagsQuery['releaseFlags'][number]

interface ReleaseFlagRowProps {
  releaseId: string
  flag: ReleaseFlagRowData
  canDecide: boolean
  showDecision: boolean
  selectable: boolean
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  onToggleEnvironment: (environmentName: string, nextEnabled: boolean) => void
  canWriteFlags: boolean
}

export function ReleaseFlagRow({
  releaseId,
  flag,
  canDecide,
  showDecision,
  selectable,
  selected,
  onSelectedChange,
  onToggleEnvironment,
  canWriteFlags,
}: ReleaseFlagRowProps) {
  const { t } = useTranslation(['releases', 'flags'])
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()

  const prLinks = Array.from(
    new Map(flag.changes.map((change) => [change.prNumber, change])).values(),
  )

  return (
    <div
      className={[
        'flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0',
        selected ? '-mx-2 rounded-lg border-transparent bg-brand-indigo-bright/8 px-2' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {selectable && (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelectedChange(checked === true)}
          aria-label={t('flags:write.actions.selectFlag', { flag: flag.key })}
        />
      )}
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
        <div className="flex flex-wrap items-center gap-2">
          {flag.feature && (
            <Link
              to={generatePath(ROUTES.PROJECT_FEATURE_DETAIL, {
                organizationId: organizationId ?? '',
                projectId: projectId ?? '',
                id: flag.feature.id,
              })}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {flag.feature.name}
            </Link>
          )}
          {flag.changes.map((change, index) => (
            <Badge
              key={`${change.kind}-${change.action}-${index}`}
              variant="outline"
              className="rounded-full font-mono text-[10px] uppercase tracking-wide"
            >
              {enumLabels.flagAction(change.action)}
            </Badge>
          ))}
        </div>
        {flag.environments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {flag.existsInFlagsmith ? (
              flag.environments.map((environment) =>
                canWriteFlags ? (
                  <button
                    key={environment.name}
                    type="button"
                    onClick={() => onToggleEnvironment(environment.name, !environment.enabled)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 transition-colors hover:border-brand-indigo-bright/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t('flags:write.actions.toggleLabel', {
                      flag: flag.key,
                      environment: environment.name,
                    })}
                  >
                    <span className="font-mono text-[11px] text-foreground">{environment.name}</span>
                    <EnvStateCell
                      enabled={environment.enabled}
                      onLabel={t('flags:state.on')}
                      offLabel={t('flags:state.off')}
                    />
                  </button>
                ) : (
                  <span
                    key={environment.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1"
                  >
                    <span className="font-mono text-[11px] text-foreground">{environment.name}</span>
                    <EnvStateCell
                      enabled={environment.enabled}
                      onLabel={t('flags:state.on')}
                      offLabel={t('flags:state.off')}
                    />
                  </span>
                ),
              )
            ) : (
              <span className="text-xs text-muted-foreground">{t('flags:write.notInFlagsmith')}</span>
            )}
          </div>
        )}

        {prLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {prLinks.map((change) => (
              <FlagPrLinkChip
                key={change.prNumber}
                prNumber={change.prNumber}
                prTitle={change.prTitle}
                prUrl={change.prUrl}
              />
            ))}
          </div>
        )}
      </div>

      {!showDecision ? (
        <span className="text-xs text-muted-foreground">{t('flags.removedNote')}</span>
      ) : canDecide ? (
        <ReleaseFlagDecisionSelect
          releaseId={releaseId}
          trackedFlagId={flag.id}
          decision={flag.decision}
        />
      ) : flag.decision ? (
        <Badge variant="outline" className="rounded-full">
          {enumLabels.releaseFlagDecision(flag.decision)}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">{t('flags.noDecision')}</span>
      )}

      {showDecision && flag.feature && flag.suggestedFeatureState && (
        <FlagFeatureStateSuggestion
          releaseId={releaseId}
          featureId={flag.feature.id}
          featureName={flag.feature.name}
          flagKey={flag.key}
          suggestedState={flag.suggestedFeatureState}
          currentState={flag.featureReleaseState}
        />
      )}
    </div>
  )
}
