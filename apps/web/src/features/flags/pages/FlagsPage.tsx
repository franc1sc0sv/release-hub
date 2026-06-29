import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  GitCompare,
  Loader2,
  Search,
  ShieldOff,
} from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { PageHeader } from '@/components/nebula/PageHeader'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { slideUp } from '@/lib/animations'
import type { FlagSortField, SortDirection } from '@/generated/graphql'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useFlags } from '../hooks/use-flags'
import { FlagMatrix } from '../components/FlagMatrix'
import { ColumnVisibilityMenu } from '../components/ColumnVisibilityMenu'
import { CompareFlagsDialog } from '../components/CompareFlagsDialog'

const PAGE_SIZE = 100

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default function FlagsPage() {
  const { t } = useTranslation('flags')
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()

  const flagsmithEnabled = activeProject?.integrations.flagsmith ?? false
  const projectId = activeProject?.id ?? null

  const [searchInput, setSearchInput] = useState('')
  const [sortField, setSortField] = useState<FlagSortField>('CREATED')
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC')
  const [activeSortEnv, setActiveSortEnv] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [compareOpen, setCompareOpen] = useState(false)

  const [hiddenEnvs, setHiddenEnvs] = useLocalStorage<string[]>(
    `release-hub:flags:columns:${projectId ?? 'none'}`,
    [],
  )

  const debouncedSearch = useDebounced(searchInput, 300)

  const { environments, items, totalCount, loading, error, refetch } = useFlags({
    projectId: flagsmithEnabled ? projectId : null,
    search: debouncedSearch || undefined,
    sortField,
    sortEnvironment: activeSortEnv,
    sortDirection,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  const visibleEnvironments = environments.filter((e) => !hiddenEnvs.includes(e))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

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

  if (!flagsmithEnabled) {
    return (
      <NebulaBackground className="p-6">
        <motion.div
          variants={slideUp}
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="mx-auto max-w-7xl space-y-8"
        >
          <PageHeader overline={t('subtitle')} title={t('title')} />
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
        </motion.div>
      </NebulaBackground>
    )
  }

  return (
    <TooltipProvider>
      <NebulaBackground className="p-6">
        <motion.div
          variants={slideUp}
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="mx-auto max-w-7xl space-y-8"
        >
          <PageHeader overline={t('subtitle')} title={t('title')} />

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-9 rounded-full"
                aria-label={t('search.placeholder')}
              />
            </div>

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
              className="rounded-full gap-2"
              disabled={visibleEnvironments.length < 2}
              onClick={() => setCompareOpen(true)}
            >
              <GitCompare className="size-4" aria-hidden />
              {t('compare.button')}
            </Button>
          </div>

          {loading && (
            <GlassCard>
              <CardContent className="flex flex-col items-center gap-4 py-16">
                <Loader2 className="size-10 animate-spin text-brand-indigo-bright" aria-hidden />
                <p className="text-sm text-muted-foreground">{t('loading')}</p>
              </CardContent>
            </GlassCard>
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
        </motion.div>
      </NebulaBackground>

      {projectId && (
        <CompareFlagsDialog
          open={compareOpen}
          onOpenChange={setCompareOpen}
          projectId={projectId}
          visibleEnvironments={visibleEnvironments}
        />
      )}
    </TooltipProvider>
  )
}
