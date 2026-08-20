import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Loader2, AlertCircle, FlagIcon, TriangleAlert, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SearchField } from '@/components/nebula/SearchField'
import { Can, useAbility } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { EnvironmentActionMenu } from '@/features/flags/components/EnvironmentActionMenu'
import { FlagChangePreviewDialog } from '@/features/flags/components/FlagChangePreviewDialog'
import { FlagDeleteConfirmDialog } from '@/features/flags/components/FlagDeleteConfirmDialog'
import { useFlagWriteActions } from '@/features/flags/hooks/use-flag-write-actions'
import type { FlagChangeTarget, FlagDeleteTarget } from '@/features/flags/types/flag-change-target'
import { useReleaseFlags } from '../hooks/useReleaseFlags'
import { FlagScanButton } from './FlagScanButton'
import { ReleaseFlagRow } from './ReleaseFlagRow'
import { CarriedOverFlagsPanel } from './CarriedOverFlagsPanel'
import { FlagChangeActionValue } from '../constants/release-enums'
import type { ReleaseFlagsQuery } from '@/generated/graphql'

type ReleaseFlagRowData = ReleaseFlagsQuery['releaseFlags'][number]

interface ReleaseFlagsTabProps {
  releaseId: string
}

function isRemovedFlag(flag: ReleaseFlagRowData): boolean {
  return flag.changes.some((change) => change.action === FlagChangeActionValue.removed)
}

function isAddedFlag(flag: ReleaseFlagRowData): boolean {
  return !isRemovedFlag(flag)
}

export function ReleaseFlagsTab({ releaseId }: ReleaseFlagsTabProps) {
  const { t } = useTranslation(['releases', 'flags'])
  const { projectId } = useParams<{ projectId: string }>()
  const ability = useAbility()
  const { flags, loading, error, refetch } = useReleaseFlags(releaseId)
  const [search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [changeTargets, setChangeTargets] = useState<FlagChangeTarget[] | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<FlagDeleteTarget[] | null>(null)

  const { applyStates, deleteFlags, resetReport, report, pending } = useFlagWriteActions(projectId ?? '')

  const canWriteFlags = ability.can(Action.UPDATE, Subject.PROJECT)
  const canDeleteFlags = ability.can(Action.MANAGE, Subject.PROJECT)

  const filteredFlags = flags.filter((flag) =>
    flag.key.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const addedFlags = filteredFlags.filter(isAddedFlag)
  const removedFlags = filteredFlags.filter(isRemovedFlag)
  const undecidedCount = flags.filter(
    (flag) => isAddedFlag(flag) && flag.decision === null,
  ).length

  const environments = flags[0]?.environments.map((environment) => environment.name) ?? []
  const selectedFlags = flags.filter(
    (flag) => selectedKeys.includes(flag.key) && flag.existsInFlagsmith,
  )

  function toggleSelected(key: string, selected: boolean) {
    setSelectedKeys((current) =>
      selected ? [...current, key] : current.filter((entry) => entry !== key),
    )
  }

  function openStateChange(enabled: boolean, environmentNames: string[]) {
    const targets = selectedFlags.flatMap((flag) =>
      flag.environments
        .filter(
          (environment) =>
            environmentNames.includes(environment.name) && environment.enabled !== enabled,
        )
        .map((environment) => ({
          flagKey: flag.key,
          environmentName: environment.name,
          currentEnabled: environment.enabled,
          nextEnabled: enabled,
        })),
    )
    setChangeTargets(targets)
  }

  function openSingleToggle(flag: ReleaseFlagRowData, environmentName: string, nextEnabled: boolean) {
    const environment = flag.environments.find((entry) => entry.name === environmentName)
    if (!environment) return
    setChangeTargets([
      {
        flagKey: flag.key,
        environmentName,
        currentEnabled: environment.enabled,
        nextEnabled,
      },
    ])
  }

  function openDelete() {
    setDeleteTargets(
      selectedFlags.map((flag) => ({
        flagKey: flag.key,
        environments: flag.environments
          .filter((environment) => environment.enabled)
          .map((environment) => environment.name),
      })),
    )
  }

  function closeWriteDialogs() {
    setChangeTargets(null)
    setDeleteTargets(null)
    if (report) {
      resetReport()
      setSelectedKeys([])
      void refetch()
    }
  }

  function renderRows(rows: ReleaseFlagRowData[], canDecide: boolean, showDecision: boolean) {
    return rows.map((flag) => (
      <ReleaseFlagRow
        key={flag.id}
        releaseId={releaseId}
        flag={flag}
        canDecide={canDecide}
        showDecision={showDecision}
        selectable={canWriteFlags && flag.existsInFlagsmith}
        selected={selectedKeys.includes(flag.key)}
        onSelectedChange={(selected) => toggleSelected(flag.key, selected)}
        onToggleEnvironment={(environmentName, nextEnabled) =>
          openSingleToggle(flag, environmentName, nextEnabled)
        }
        canWriteFlags={canWriteFlags}
      />
    ))
  }

  return (
    <div className="space-y-4">
      {!loading && !error && undecidedCount > 0 && (
        <Alert>
          <TriangleAlert className="size-4 text-amber-400" aria-hidden />
          <AlertTitle>{t('flags.pending.heading', { count: undecidedCount })}</AlertTitle>
          <AlertDescription>{t('flags.pending.description')}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField
          value={search}
          onValueChange={setSearch}
          placeholder={t('flags.searchPlaceholder')}
          className="w-full max-w-xs"
        />
        <FlagScanButton releaseId={releaseId} />
      </div>

      <CarriedOverFlagsPanel releaseId={releaseId} />

      {loading && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="size-6 animate-spin text-brand-indigo-bright" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.loading')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.error')}</p>
        </div>
      )}

      {!loading && !error && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.empty')}</p>
        </div>
      )}

      {!loading && !error && flags.length > 0 && (
        <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
          {(canDecide) => (
            <Tabs defaultValue="added">
              <TabsList variant="line" aria-label={t('flags.subTabs.label')}>
                <TabsTrigger value="added">
                  {t('flags.subTabs.added')}
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {addedFlags.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="removed">
                  {t('flags.subTabs.removed')}
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {removedFlags.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="added" className="pt-2">
                {addedFlags.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">{t('flags.subTabs.addedEmpty')}</p>
                  </div>
                ) : (
                  <div>{renderRows(addedFlags, canDecide, true)}</div>
                )}
              </TabsContent>

              <TabsContent value="removed" className="pt-2">
                {removedFlags.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">{t('flags.subTabs.removedEmpty')}</p>
                  </div>
                ) : (
                  <div>{renderRows(removedFlags, canDecide, false)}</div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </Can>
      )}

      {selectedFlags.length > 0 && (
        <div
          role="region"
          aria-label={t('flags:write.actions.selectionBar')}
          className="glass sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-brand-indigo-bright/40 px-3 py-2 shadow-lg"
        >
          <p className="mr-auto text-sm text-foreground">
            {t('flags:write.actions.selectedCount', { count: selectedFlags.length })}
          </p>
          <EnvironmentActionMenu
            label={t('flags:write.actions.enableIn')}
            environments={environments}
            onApply={(environmentNames) => openStateChange(true, environmentNames)}
          />
          <EnvironmentActionMenu
            label={t('flags:write.actions.disableIn')}
            environments={environments}
            onApply={(environmentNames) => openStateChange(false, environmentNames)}
          />
          {canDeleteFlags && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={openDelete}
            >
              <Trash2 className="size-4" aria-hidden />
              {t('flags:write.actions.delete')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelectedKeys([])}>
            {t('flags:write.actions.clearSelection')}
          </Button>
        </div>
      )}

      <FlagChangePreviewDialog
        open={changeTargets !== null}
        onOpenChange={(open) => {
          if (!open) closeWriteDialogs()
        }}
        targets={changeTargets ?? []}
        pending={pending}
        report={report}
        onConfirm={(selected) => void applyStates(selected)}
        onClose={closeWriteDialogs}
      />

      <FlagDeleteConfirmDialog
        open={deleteTargets !== null}
        onOpenChange={(open) => {
          if (!open) closeWriteDialogs()
        }}
        targets={deleteTargets ?? []}
        pending={pending}
        report={report}
        onConfirm={(flagKeys) => void deleteFlags(flagKeys)}
        onClose={closeWriteDialogs}
      />
    </div>
  )
}
