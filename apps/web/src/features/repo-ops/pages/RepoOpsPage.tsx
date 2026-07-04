import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, ChevronLeft, ChevronRight, GitBranch } from 'lucide-react'
import { PageShell } from '@/components/nebula/PageShell'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { Skeleton } from '@/components/ui/skeleton'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useProject } from '@/context/project.context'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import type {
  BranchActivityRange,
  BranchCleanupPageItemType,
  BranchCleanupSortField,
  BranchProtectionFilter,
  BranchSignalFilter,
} from '@/generated/graphql'
import { useBranchCleanupPage } from '../hooks/use-branch-cleanup-page'
import { useBranchAuthors } from '../hooks/use-branch-authors'
import { BranchCleanupTable } from '../components/BranchCleanupTable'
import { BranchFilterBar } from '../components/BranchFilterBar'
import { SelectionActionBar } from '../components/SelectionActionBar'
import { DeleteBranchesDialog } from '../components/DeleteBranchesDialog'
import { CleanAllBranchesDialog } from '../components/CleanAllBranchesDialog'
import { SortDirectionValue, type IBranchSort } from '../constants/branch-sort'

const PAGE_SIZE = 15

function BranchRowSkeleton() {
  return <Skeleton className="h-14 w-full rounded-[var(--radius-card)]" />
}

export default function RepoOpsPage() {
  const { t } = useTranslation('repoOps')
  const { activeProject } = useProject()
  const projectId = activeProject?.id ?? null

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<IBranchSort | null>(null)
  const [authorFilter, setAuthorFilter] = useState('')
  const [activity, setActivity] = useState<BranchActivityRange | null>(null)
  const [protection, setProtection] = useState<BranchProtectionFilter | null>(null)
  const [signalFilters, setSignalFilters] = useState<BranchSignalFilter[]>([])
  const [selectedItems, setSelectedItems] = useState<Map<string, BranchCleanupPageItemType>>(new Map())
  const [overriddenBranches, setOverriddenBranches] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { items, totalCount, loading, error, refetch } = useBranchCleanupPage({
    projectId,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    search,
    sortField: sort?.field ?? null,
    sortDirection: sort?.direction,
    authorFilter,
    activity,
    protection,
    signals: signalFilters,
  })

  const { authors } = useBranchAuthors(projectId)

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const selectedBranches = useMemo(() => Array.from(selectedItems.values()), [selectedItems])

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(field: BranchCleanupSortField) {
    setSort((prev) => {
      if (!prev || prev.field !== field) return { field, direction: SortDirectionValue.DESC }
      if (prev.direction === SortDirectionValue.DESC) return { field, direction: SortDirectionValue.ASC }
      return null
    })
    setPage(1)
  }

  function handleCleanCompleted() {
    setSelectedItems(new Map())
    void refetch()
  }

  function handleAuthorFilterChange(value: string) {
    setAuthorFilter(value)
    setPage(1)
  }

  function handleActivityChange(value: BranchActivityRange | null) {
    setActivity(value)
    setPage(1)
  }

  function handleProtectionChange(value: BranchProtectionFilter | null) {
    setProtection(value)
    setPage(1)
  }

  function handleSignalFiltersChange(value: BranchSignalFilter[]) {
    setSignalFilters(value)
    setPage(1)
  }

  function handleToggle(item: BranchCleanupPageItemType) {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      if (next.has(item.name)) {
        next.delete(item.name)
      } else {
        next.set(item.name, item)
      }
      return next
    })
  }

  function handleToggleAll(targets: BranchCleanupPageItemType[], select: boolean) {
    setSelectedItems((prev) => {
      const next = new Map(prev)
      for (const item of targets) {
        if (select) {
          next.set(item.name, item)
        } else {
          next.delete(item.name)
        }
      }
      return next
    })
  }

  function handleUnprotect(branchName: string) {
    setOverriddenBranches((prev) => new Set(prev).add(branchName))
  }

  function handleClearSelection() {
    setSelectedItems(new Map())
  }

  function handleDeleted() {
    setSelectedItems(new Map())
    void refetch()
  }

  const body = (() => {
    if (loading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <BranchRowSkeleton key={index} />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="size-7 text-destructive" aria-hidden />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">{t('error.heading')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('error.description')}</p>
            </div>
            <Button variant="outline" onClick={() => void refetch()}>
              {t('error.retry')}
            </Button>
          </CardContent>
        </GlassCard>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchField
            value={search}
            onValueChange={handleSearchChange}
            placeholder={t('search.placeholder')}
            className="w-64"
          />
          <BranchFilterBar
            authors={authors}
            authorFilter={authorFilter}
            onAuthorChange={handleAuthorFilterChange}
            activity={activity}
            onActivityChange={handleActivityChange}
            protection={protection}
            onProtectionChange={handleProtectionChange}
            signalFilters={signalFilters}
            onSignalsChange={handleSignalFiltersChange}
          />
        </div>

        <SelectionActionBar
          count={selectedItems.size}
          onClear={handleClearSelection}
          onDelete={() => setDeleteDialogOpen(true)}
        />

        {items.length === 0 || !projectId ? (
          <EmptyState
            icon={<GitBranch className="size-7 text-brand-indigo-bright" aria-hidden />}
            heading={t('empty.heading')}
            description={t('empty.description')}
          />
        ) : (
          <BranchCleanupTable
            projectId={projectId}
            items={items}
            selected={new Set(selectedItems.keys())}
            overriddenBranches={overriddenBranches}
            sort={sort}
            onSortChange={handleSortChange}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onUnprotect={handleUnprotect}
          />
        )}

        {totalPages > 1 && (
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
      </div>
    )
  })()

  return (
    <TooltipProvider>
      <PageShell
        eyebrow={t('subtitle')}
        title={t('title')}
        description={t('description')}
        actions={
          !loading && !error && projectId ? (
            <div className="flex items-center gap-3">
              <div className="glass flex items-center gap-2 rounded-full border border-border/60 px-4 py-2">
                <GitBranch className="size-4 text-brand-indigo-bright" aria-hidden />
                <span className="font-mono text-base font-semibold text-foreground">{totalCount}</span>
                <span className="text-sm text-muted-foreground">
                  {t('header.branchCountLabel', { count: totalCount })}
                </span>
              </div>
              <Can I={Action.MANAGE} a={Subject.PROJECT}>
                <CleanAllBranchesDialog projectId={projectId} onCompleted={handleCleanCompleted} />
              </Can>
            </div>
          ) : undefined
        }
      >
        {body}
      </PageShell>

      {projectId && (
        <DeleteBranchesDialog
          projectId={projectId}
          branches={selectedBranches}
          overriddenBranchNames={selectedBranches
            .map((branch) => branch.name)
            .filter((name) => overriddenBranches.has(name))}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={handleDeleted}
        />
      )}
    </TooltipProvider>
  )
}
