import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, generatePath } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import {
  AlertCircle,
  Download,
  Flag,
  GitCompare,
  Loader2,
  RadarIcon,
  RefreshCw,
  ShieldOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/nebula/PageShell'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import type { SyncFlagsmithFlagsMutation } from '@/generated/graphql'
import { useFlags } from '../hooks/use-flags'
import { useFlagFilters } from '../hooks/use-flag-filters'
import { useRunFlagCoverage } from '../hooks/use-run-flag-coverage'
import { useSyncFlagsmithFlags } from '../hooks/use-sync-flagsmith-flags'
import { applyFlagFilters } from '../lib/flag-filtering'
import { FlagMatrix } from '../components/FlagMatrix'
import { ColumnVisibilityMenu } from '../components/ColumnVisibilityMenu'
import { CompareFlagsDialog } from '../components/CompareFlagsDialog'
import { ExportFlagsDialog } from '../components/ExportFlagsDialog'
import { FlagStatusFilterMenu } from '../components/FlagStatusFilterMenu'
import { FlagActivityFilterMenu } from '../components/FlagActivityFilterMenu'
import { FlagSyncReportDialog } from '../components/FlagSyncReportDialog'

type FlagSyncReport = SyncFlagsmithFlagsMutation['syncFlagsmithFlags']

export default function FlagsPage() {
  const { t, i18n } = useTranslation('flags')
  const navigate = useNavigate()
  const { activeProject } = useProject()

  const flagsmithEnabled = activeProject?.integrations.flagsmith ?? false
  const projectId = activeProject?.id ?? null

  const { filters, setSearch, setSort, setStatuses, setActivity, toggleEnvironmentColumn } =
    useFlagFilters()

  const [compareOpen, setCompareOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [syncReportOpen, setSyncReportOpen] = useState(false)
  const [syncReport, setSyncReport] = useState<FlagSyncReport | null>(null)

  const projectName = activeProject?.name ?? ''

  const { run: runCoverage, loading: runningCoverage } = useRunFlagCoverage(projectId ?? '')
  const { sync: syncFlags, loading: syncing } = useSyncFlagsmithFlags(projectId ?? '')

  async function handleRunCoverage(): Promise<void> {
    try {
      const result = await runCoverage()
      const summary = result.data?.runFlagCoverage
      if (summary) {
        toast.success(
          t('coverage.success', {
            flagsTracked: summary.flagsTracked,
            branchesScanned: summary.branchesScanned,
            prChangesDetected: summary.prChangesDetected,
          }),
        )
      }
    } catch {
      toast.error(t('coverage.error'))
    }
  }

  const { environments, items, lastSyncedAt, loading, error, refetch } = useFlags({
    projectId: flagsmithEnabled ? projectId : null,
  })

  async function handleSync(): Promise<void> {
    try {
      const result = await syncFlags()
      const report = result.data?.syncFlagsmithFlags ?? null
      await refetch()
      if (report) {
        setSyncReport(report)
        setSyncReportOpen(true)
      }
    } catch {
      toast.error(t('sync.error'))
    }
  }

  const visibleEnvironments = useMemo(
    () => environments.filter((e) => !filters.hiddenEnvironments.includes(e)),
    [environments, filters.hiddenEnvironments],
  )
  const visibleItems = useMemo(() => applyFlagFilters(items, filters), [items, filters])
  const neverSynced = !loading && !error && lastSyncedAt === null

  const syncButton = (
    <Can I={Action.UPDATE} a={Subject.PROJECT}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={!projectId || syncing}
        onClick={() => void handleSync()}
      >
        {syncing ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
        {syncing ? t('sync.syncing') : t('sync.button')}
      </Button>
    </Can>
  )

  if (!flagsmithEnabled) {
    return (
      <PageShell eyebrow={t('subtitle')} title={t('title')}>
        <EmptyState
          icon={<ShieldOff className="size-7 text-brand-indigo-bright" aria-hidden />}
          heading={t('notConnected.heading')}
          description={t('notConnected.description')}
          action={
            <Button
              variant="outline"
              onClick={() =>
                activeProject &&
                navigate(
                  generatePath(ROUTES.PROJECT_SETTINGS, {
                    organizationId: activeProject.organizationId,
                    projectId: activeProject.id,
                  }),
                )
              }
            >
              {t('notConnected.cta')}
            </Button>
          }
        />
      </PageShell>
    )
  }

  return (
    <TooltipProvider>
      <PageShell
        eyebrow={t('subtitle')}
        title={t('title')}
        actions={
          <div className="flex items-center gap-3">
            {lastSyncedAt && (
              <span className="font-mono text-xs text-muted-foreground">
                {t('sync.lastSynced', {
                  time: formatDistanceToNow(new Date(lastSyncedAt), {
                    addSuffix: true,
                    locale: i18n.language.startsWith('es') ? es : enUS,
                  }),
                })}
              </span>
            )}
            {syncButton}
          </div>
        }
      >
        <div className="space-y-8">
          {neverSynced ? (
            <EmptyState
              icon={<RefreshCw className="size-7 text-brand-indigo-bright" aria-hidden />}
              heading={t('neverSynced.heading')}
              description={t('neverSynced.description')}
              action={
                <Can I={Action.UPDATE} a={Subject.PROJECT}>
                  <Button disabled={!projectId || syncing} onClick={() => void handleSync()} className="gap-2">
                    {syncing ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <RefreshCw className="size-4" aria-hidden />
                    )}
                    {syncing ? t('sync.syncing') : t('neverSynced.cta')}
                  </Button>
                </Can>
              }
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <SearchField
                  value={filters.search}
                  onValueChange={setSearch}
                  placeholder={t('search.placeholder')}
                  className="flex-1 min-w-52"
                />

                {environments.length > 0 && (
                  <ColumnVisibilityMenu
                    environments={environments}
                    hiddenEnvs={filters.hiddenEnvironments}
                    onToggle={toggleEnvironmentColumn}
                  />
                )}

                <FlagStatusFilterMenu selected={filters.statuses} onChange={setStatuses} />

                <FlagActivityFilterMenu selected={filters.activity} onChange={setActivity} />

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={visibleEnvironments.length < 2}
                  onClick={() => setCompareOpen(true)}
                >
                  <GitCompare className="size-4" aria-hidden />
                  {t('compare.button')}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={environments.length < 2}
                  onClick={() => setExportOpen(true)}
                >
                  <Download className="size-4" aria-hidden />
                  {t('export.button')}
                </Button>

                <Can I={Action.UPDATE} a={Subject.PROJECT}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!projectId || runningCoverage}
                    onClick={() => void handleRunCoverage()}
                  >
                    {runningCoverage ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <RadarIcon className="size-4" aria-hidden />
                    )}
                    {t('coverage.button')}
                  </Button>
                </Can>
              </div>

              {loading && (
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-[var(--radius-card)]" />
                  ))}
                </div>
              )}

              {error && !loading && (
                <GlassCard>
                  <CardContent className="flex flex-col items-center gap-4 py-16">
                    <div className="flex size-14 items-center justify-center rounded-full bg-destructive/20">
                      <AlertCircle className="size-7 text-destructive" aria-hidden />
                    </div>
                    <div className="text-center">
                      <p className="font-display text-lg font-semibold text-foreground">
                        {t('error.heading')}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{t('error.description')}</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()}>
                      {t('error.retry')}
                    </Button>
                  </CardContent>
                </GlassCard>
              )}

              {!loading && !error && visibleItems.length === 0 && (
                <EmptyState
                  icon={<Flag className="size-7 text-brand-indigo-bright" aria-hidden />}
                  heading={t('empty.heading')}
                  description={t('empty.description')}
                />
              )}

              {!loading && !error && visibleItems.length > 0 && (
                <FlagMatrix
                  items={visibleItems}
                  totalCount={visibleItems.length}
                  visibleEnvironments={visibleEnvironments}
                  sortField={filters.sortField}
                  sortDirection={filters.sortDirection}
                  onSortChange={setSort}
                  activeSortEnv={filters.sortEnvironment}
                />
              )}
            </>
          )}
        </div>
      </PageShell>

      <FlagSyncReportDialog
        open={syncReportOpen}
        onOpenChange={setSyncReportOpen}
        report={syncReport}
      />

      {projectId && (
        <>
          <CompareFlagsDialog
            open={compareOpen}
            onOpenChange={setCompareOpen}
            projectId={projectId}
            visibleEnvironments={visibleEnvironments}
          />
          <ExportFlagsDialog
            open={exportOpen}
            onOpenChange={setExportOpen}
            projectId={projectId}
            projectName={projectName}
            environments={environments}
          />
        </>
      )}
    </TooltipProvider>
  )
}
