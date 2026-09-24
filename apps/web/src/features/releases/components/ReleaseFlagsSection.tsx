import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertCircle, FlagIcon, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchField } from '@/components/nebula/SearchField'
import { GlassCard } from '@/components/nebula/GlassCard'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAbility } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { ROUTES } from '@/lib/routes'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ColumnVisibilityMenu } from '@/features/flags/components/ColumnVisibilityMenu'
import { EnvironmentActionMenu } from '@/features/flags/components/EnvironmentActionMenu'
import { FlagDeleteConfirmDialog } from '@/features/flags/components/FlagDeleteConfirmDialog'
import { useFlagWriteActions } from '@/features/flags/hooks/use-flag-write-actions'
import type { FlagDeleteTarget } from '@/features/flags/types/flag-change-target'
import { useReleaseFlags } from '../hooks/useReleaseFlags'
import { useStagedFlagChanges } from '../hooks/useStagedFlagChanges'
import { isRemovedReleaseFlag, needsReleaseFlagDecision } from '../hooks/useReleaseWorkspaceStats'
import { FlagScanButton } from './FlagScanButton'
import { FlagPrLinkChip } from './FlagPrLinkChip'
import { FlagDecisionControl } from './FlagDecisionControl'
import { FlagEnvironmentCell } from './FlagEnvironmentCell'
import { StagedFlagChangesTray } from './StagedFlagChangesTray'
import { ReleaseSectionHeading } from './ReleaseSectionHeading'
import { isDefaultVisibleEnvironment } from '../constants/release-environments'
import { FlagChangeActionValue, ReleaseFlagDecisionTypeValue, ReleaseStatusValue } from '../constants/release-enums'
import type { ReleaseFlagDecisionType, ReleaseFlagsQuery, ReleaseStatus } from '@/generated/graphql'

type ReleaseFlag = ReleaseFlagsQuery['releaseFlags'][number]

const SHIPPED_RELEASE_STATUSES: ReleaseStatus[] = [ReleaseStatusValue.MERGED, ReleaseStatusValue.DEPLOYED]

interface ReleaseFlagsSectionProps {
  releaseId: string
  releaseStatus: ReleaseStatus
}

export function ReleaseFlagsSection({ releaseId, releaseStatus }: ReleaseFlagsSectionProps) {
  const { t } = useTranslation(['releases', 'flags'])
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const ability = useAbility()
  const { flags, loading, error, refetch } = useReleaseFlags(releaseId)
  const staging = useStagedFlagChanges()
  const { applyStates, deleteFlags, resetReport, report, pending } = useFlagWriteActions(projectId ?? '')
  const [search, setSearch] = useState('')
  const [hiddenEnvsOverride, setHiddenEnvsOverride] = useState<string[] | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<FlagDeleteTarget[] | null>(null)

  const canDecide = ability.can(Action.UPDATE, Subject.RELEASE)
  const canWriteFlags = ability.can(Action.UPDATE, Subject.PROJECT)
  const canDeleteFlags = ability.can(Action.MANAGE, Subject.PROJECT)

  const environments = flags[0]?.environments.map((environment) => environment.name) ?? []
  const hiddenEnvs = hiddenEnvsOverride ?? environments.filter((name) => !isDefaultVisibleEnvironment(name))
  const visibleEnvironments = environments.filter((name) => !hiddenEnvs.includes(name))

  const normalizedSearch = search.trim().toLowerCase()
  const filteredFlags = flags.filter((flag) => flag.key.toLowerCase().includes(normalizedSearch))
  const addedFlags = filteredFlags.filter((flag) => !isRemovedReleaseFlag(flag))
  const removedFlags = filteredFlags.filter(isRemovedReleaseFlag)
  const undecidedCount = flags.filter((flag) => needsReleaseFlagDecision(flag) && flag.decision === null).length
  const deletableRemovedFlags = removedFlags.filter((flag) => flag.existsInFlagsmith)
  const writableFlags = filteredFlags.filter((flag) => flag.existsInFlagsmith)
  const canBulkDeleteRemoved = canDeleteFlags && SHIPPED_RELEASE_STATUSES.includes(releaseStatus)

  function toggleEnvironmentVisibility(environmentName: string, hidden: boolean) {
    setHiddenEnvsOverride(
      hidden ? [...hiddenEnvs, environmentName] : hiddenEnvs.filter((entry) => entry !== environmentName),
    )
  }

  function handleDecided(flag: ReleaseFlag, decision: ReleaseFlagDecisionType) {
    if (decision !== ReleaseFlagDecisionTypeValue.ENABLE_IN_RELEASE || !canWriteFlags || !flag.existsInFlagsmith) return
    staging.stageState([flag], visibleEnvironments, true)
  }

  async function handleApply() {
    try {
      const result = await applyStates(staging.targets)
      const failed = result?.results.filter((entry) => !entry.ok) ?? []
      staging.settle(
        failed.flatMap((entry) =>
          entry.environmentName
            ? [{ flagKey: entry.flagKey, environmentName: entry.environmentName, error: entry.error ?? null }]
            : [],
        ),
      )
      resetReport()
      await refetch()
      if (failed.length === 0) {
        toast.success(t('workspace.flags.tray.applied', { count: result?.succeeded ?? 0 }))
      } else {
        toast.error(t('workspace.flags.tray.partial', { failed: failed.length }))
      }
    } catch (applyError) {
      toast.error(applyError instanceof Error && applyError.message ? applyError.message : t('workspace.flags.tray.error'))
    }
  }

  function closeDeleteDialog() {
    setDeleteTargets(null)
    if (report) {
      resetReport()
      void refetch()
    }
  }

  function renderRow(flag: ReleaseFlag, removed: boolean) {
    const editable = canWriteFlags && flag.existsInFlagsmith
    const prLinks = [...new Map(flag.changes.map((change) => [change.prNumber, change])).values()]

    return (
      <TableRow key={flag.id}>
        <TableCell className="min-w-60 whitespace-normal align-top">
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
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {flag.feature && <span>{flag.feature.name}</span>}
            {prLinks.map((change) => (
              <FlagPrLinkChip key={change.prNumber} prNumber={change.prNumber} prTitle={change.prTitle} prUrl={change.prUrl} />
            ))}
            {!flag.existsInFlagsmith && <span>{t('flags:write.notInFlagsmith')}</span>}
          </div>
          <div className="mt-2.5">
            {removed ? (
              <Badge variant="outline" className="rounded-full">{enumLabels.flagAction(FlagChangeActionValue.removed)}</Badge>
            ) : flag.closedAt ? (
              <StatusBadge tone={StatusBadgeTone.SLATE}>{t('workspace.flags.closed')}</StatusBadge>
            ) : (
              <FlagDecisionControl
                releaseId={releaseId}
                trackedFlagId={flag.id}
                flagKey={flag.key}
                decision={flag.decision}
                canDecide={canDecide}
                onDecided={(decision) => handleDecided(flag, decision)}
              />
            )}
          </div>
        </TableCell>
        {visibleEnvironments.map((environmentName) => {
          const environment = flag.environments.find((entry) => entry.name === environmentName)
          return (
            <TableCell key={environmentName} className="w-24 px-1">
              {environment ? (
                <FlagEnvironmentCell
                  flagKey={flag.key}
                  environmentName={environmentName}
                  enabled={environment.enabled}
                  staged={staging.isStaged(flag.key, environmentName)}
                  failure={staging.failureFor(flag.key, environmentName)?.error ?? null}
                  editable={editable}
                  onToggle={() => staging.toggle(flag, environment)}
                />
              ) : (
                <span className="block text-center text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          )
        })}
      </TableRow>
    )
  }

  function renderGroupHeader(label: string, count: number, tone: StatusBadgeToneValue) {
    return (
      <TableRow className="bg-white/[0.02] hover:bg-white/[0.02]">
        <TableCell colSpan={visibleEnvironments.length + 1} className="py-2">
          <span className="flex items-center gap-2">
            <StatusBadge tone={tone}>{label}</StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">{count}</span>
          </span>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <section aria-labelledby="release-flags-heading" className="space-y-5">
      <ReleaseSectionHeading
        id="release-flags-heading"
        title={t('workspace.sections.flags')}
        description={
          undecidedCount > 0
            ? t('workspace.flags.descriptionPending', { count: undecidedCount })
            : t('workspace.flags.description')
        }
        actions={
          <>
            <SearchField
              value={search}
              onValueChange={setSearch}
              placeholder={t('flags.searchPlaceholder')}
              className="w-full sm:w-56"
            />
            {environments.length > 0 && (
              <ColumnVisibilityMenu
                environments={environments}
                hiddenEnvs={hiddenEnvs}
                onToggle={toggleEnvironmentVisibility}
                label={t('flags:columns.label')}
              />
            )}
            <FlagScanButton releaseId={releaseId} />
          </>
        }
      />

      {canWriteFlags && writableFlags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t('workspace.flags.bulk.label', { count: writableFlags.length })}
          </span>
          <EnvironmentActionMenu
            label={t('flags:write.actions.enableIn')}
            environments={environments}
            onApply={(environmentNames) => staging.stageState(writableFlags, environmentNames, true)}
          />
          <EnvironmentActionMenu
            label={t('flags:write.actions.disableIn')}
            environments={environments}
            onApply={(environmentNames) => staging.stageState(writableFlags, environmentNames, false)}
          />
        </div>
      )}

      {loading && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="size-6 animate-spin text-brand-indigo-bright" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.loading')}</p>
        </div>
      )}

      {error && !loading && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.error')}</p>
        </div>
      )}

      {!loading && !error && flags.length === 0 && (
        <GlassCard className="flex flex-col items-center gap-3 py-12 text-center">
          <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.empty')}</p>
        </GlassCard>
      )}

      {flags.length > 0 && (
        <GlassCard className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('workspace.flags.columns.flagAndDecision')}</TableHead>
                {visibleEnvironments.map((environmentName) => (
                  <TableHead key={environmentName} className="w-24 px-1 text-center font-mono text-[11px] normal-case whitespace-normal break-words">
                    {environmentName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderGroupHeader(t('flags.subTabs.added'), addedFlags.length, StatusBadgeTone.EMERALD)}
              {addedFlags.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={visibleEnvironments.length + 1} className="text-xs text-muted-foreground">
                    {t('flags.subTabs.addedEmpty')}
                  </TableCell>
                </TableRow>
              ) : (
                addedFlags.map((flag) => renderRow(flag, false))
              )}
              {renderGroupHeader(t('flags.subTabs.removed'), removedFlags.length, StatusBadgeTone.ROSE)}
              {removedFlags.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={visibleEnvironments.length + 1} className="text-xs text-muted-foreground">
                    {t('workspace.flags.removedEmpty')}
                  </TableCell>
                </TableRow>
              ) : (
                removedFlags.map((flag) => renderRow(flag, true))
              )}
            </TableBody>
          </Table>
          {canBulkDeleteRemoved && deletableRemovedFlags.length > 0 && (
            <div className="flex justify-end border-t border-white/8 px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() =>
                  setDeleteTargets(
                    deletableRemovedFlags.map((flag) => ({
                      flagKey: flag.key,
                      environments: flag.environments.filter((entry) => entry.enabled).map((entry) => entry.name),
                    })),
                  )
                }
              >
                <Trash2 className="size-4" aria-hidden />
                {t('flags.subTabs.deleteAllRemoved', { count: deletableRemovedFlags.length })}
              </Button>
            </div>
          )}
        </GlassCard>
      )}

      {staging.targets.length > 0 && (
        <StagedFlagChangesTray
          targets={staging.targets}
          pending={pending}
          onDiscard={staging.clear}
          onApply={() => void handleApply()}
        />
      )}

      <FlagDeleteConfirmDialog
        open={deleteTargets !== null}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog()
        }}
        targets={deleteTargets ?? []}
        pending={pending}
        report={report}
        onConfirm={(flagKeys) => void deleteFlags(flagKeys)}
        onClose={closeDeleteDialog}
      />
    </section>
  )
}
