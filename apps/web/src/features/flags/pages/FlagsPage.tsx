import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import type { FlagSortField, SortDirection } from '@/generated/graphql'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useFlags } from '../hooks/use-flags'
import { useRunFlagCoverage } from '../hooks/use-run-flag-coverage'
import { useSyncFlagsmithFlags } from '../hooks/use-sync-flagsmith-flags'
import { FlagMatrix } from '../components/FlagMatrix'
import { ColumnVisibilityMenu } from '../components/ColumnVisibilityMenu'
import { CompareFlagsDialog } from '../components/CompareFlagsDialog'
import { ExportFlagsDialog } from '../components/ExportFlagsDialog'

const PAGE_SIZE = 100

export default function FlagsPage() {
  const { t, i18n } = useTranslation('flags')
  const navigate = useNavigate()
  const { activeProject } = useProject()

  const flagsmithEnabled = activeProject?.integrations.flagsmith ?? false
  const projectId = activeProject?.id ?? null

  const [searchInput, setSearchInput] = useState('')
  const [sortField, setSortField] = useState<FlagSortField>('CREATED')
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC')
  const [activeSortEnv, setActiveSortEnv] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [compareOpen, setCompareOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const projectName = activeProject?.name ?? ''

  const [hiddenEnvs, setHiddenEnvs] = useLocalStorage<string[]>(
    `release-hub:flags:columns:${projectId ?? 'none'}`,
    [],
  )

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

  const { environments, items, totalCount, lastSyncedAt, loading, error, refetch } = useFlags({
    projectId: flagsmithEnabled ? projectId : null,
    search: searchInput || undefined,
    sortField,
    sortEnvironment: activeSortEnv,
    sortDirection,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  async function handleSync(): Promise<void> {
    try {
      const result = await syncFlags()
      const flagsSynced = result.data?.syncFlagsmithFlags ?? 0
      toast.success(t('sync.success', { count: flagsSynced }))
      await refetch()
    } catch {
      toast.error(t('sync.error'))
    }
  }

  const visibleEnvironments = environments.filter((e) => !hiddenEnvs.includes(e))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const neverSynced = !loading && !error && lastSyncedAt === null

  const handleSortChange = useCallback(
    (field: FlagSortField, envName?: string) => {
      if (field === sortField && (field !== 'ENVIRONMENT' || envName === activeSortEnv)) {
        setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
      } else {
        setSortField(field)
        setActiveSortEnv(envName)
        setSortDirection('DESC')
      }
      setPage(1)
    },
    [sortField, activeSortEnv],
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    setPage(1)
  }, [])

  const handleColumnToggle = useCallback(
    (env: string, hidden: boolean) => {
      setHiddenEnvs(hidden ? [...hiddenEnvs, env] : hiddenEnvs.filter((e) => e !== env))
    },
    [hiddenEnvs, setHiddenEnvs],
  )

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
            <Button variant="outline" onClick={() => navigate(ROUTES.SETTINGS)}>
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
                  value={searchInput}
                  onValueChange={handleSearchChange}
                  placeholder={t('search.placeholder')}
                  className="flex-1 min-w-52"
                />

                {environments.length > 0 && (
                  <ColumnVisibilityMenu
                    environments={environments}
                    hiddenEnvs={hiddenEnvs}
                    onToggle={handleColumnToggle}
                  />
                )}

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

              {!loading && !error && items.length === 0 && (
                <EmptyState
                  icon={<Flag className="size-7 text-brand-indigo-bright" aria-hidden />}
                  heading={t('empty.heading')}
                  description={t('empty.description')}
                />
              )}

              {!loading && !error && items.length > 0 && (
                <FlagMatrix
                  items={items}
                  totalCount={totalCount}
                  visibleEnvironments={visibleEnvironments}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                  activeSortEnv={activeSortEnv}
                />
              )}

              {!loading && !error && totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink
                        onClick={page > 1 ? () => setPage((p) => p - 1) : undefined}
                        aria-disabled={page === 1}
                        aria-label={t('pagination.previous')}
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                      >
                        <ChevronLeft className="size-4" aria-hidden />
                        <span className="sr-only">{t('pagination.previous')}</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-4 py-2 text-sm text-muted-foreground">
                        {t('pagination.pageOf', { page, total: totalPages })}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={page < totalPages ? () => setPage((p) => p + 1) : undefined}
                        aria-disabled={page === totalPages}
                        aria-label={t('pagination.next')}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                      >
                        <span className="sr-only">{t('pagination.next')}</span>
                        <ChevronRight className="size-4" aria-hidden />
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </PageShell>

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
