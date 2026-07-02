import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, GitBranch, Sparkles } from 'lucide-react'
import { PageShell } from '@/components/nebula/PageShell'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { Skeleton } from '@/components/ui/skeleton'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProject } from '@/context/project.context'
import { useBranchCleanupCandidates } from '../hooks/use-branch-cleanup-candidates'
import { useBlockedBranches } from '../hooks/use-blocked-branches'
import { BranchCleanupTable } from '../components/BranchCleanupTable'
import { BlockedBranchesCard } from '../components/BlockedBranchesCard'
import { SelectionActionBar } from '../components/SelectionActionBar'
import { DeleteBranchesDialog } from '../components/DeleteBranchesDialog'

function BranchRowSkeleton() {
  return <Skeleton className="h-14 w-full rounded-[var(--radius-card)]" />
}

export default function RepoOpsPage() {
  const { t } = useTranslation('repoOps')
  const { activeProject } = useProject()
  const projectId = activeProject?.id ?? null

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    candidates,
    loading: candidatesLoading,
    error: candidatesError,
    refetch: refetchCandidates,
  } = useBranchCleanupCandidates(projectId)

  const {
    blockedBranches,
    loading: blockedLoading,
    error: blockedError,
  } = useBlockedBranches(projectId)

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return candidates
    return candidates.filter((candidate) => candidate.name.toLowerCase().includes(query))
  }, [candidates, search])

  function handleToggle(branchName: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(branchName)) {
        next.delete(branchName)
      } else {
        next.add(branchName)
      }
      return next
    })
  }

  function handleClearSelection() {
    setSelected(new Set())
  }

  function handleDeleted() {
    setSelected(new Set())
    void refetchCandidates()
  }

  const loading = candidatesLoading || blockedLoading
  const error = candidatesError ?? blockedError

  const body = (() => {
    if (loading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
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
              <p className="font-display text-lg font-semibold text-foreground">
                {t('error.heading')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t('error.description')}</p>
            </div>
            <Button variant="outline" onClick={() => void refetchCandidates()}>
              {t('error.retry')}
            </Button>
          </CardContent>
        </GlassCard>
      )
    }

    if (candidates.length === 0) {
      return (
        <EmptyState
          icon={<GitBranch className="size-7 text-brand-indigo-bright" aria-hidden />}
          heading={t('empty.heading')}
          description={t('empty.description')}
        />
      )
    }

    return (
      <div className="space-y-4">
        <SearchField
          value={search}
          onValueChange={setSearch}
          placeholder={t('search.placeholder')}
          className="max-w-sm"
        />
        <BranchCleanupTable
          projectId={projectId ?? ''}
          candidates={filteredCandidates}
          selected={selected}
          onToggle={handleToggle}
        />
      </div>
    )
  })()

  return (
    <PageShell eyebrow={t('subtitle')} title={t('title')} description={t('description')}>
      <div className="space-y-8">
        <GlassCard glow="indigo" className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="text-overline uppercase text-brand-magenta">{t('hero.eyebrow')}</p>
              <p className="text-base text-foreground">{t('hero.body')}</p>
            </div>
            <div
              className="flex aspect-square w-32 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-brand-indigo-bright/10"
              aria-hidden
            >
              <Sparkles className="size-10 text-brand-indigo-bright" />
            </div>
          </CardContent>
        </GlassCard>

        {body}

        {!blockedLoading && !blockedError && projectId && (
          <BlockedBranchesCard projectId={projectId} blockedBranches={blockedBranches} />
        )}
      </div>

      <SelectionActionBar
        count={selected.size}
        onClear={handleClearSelection}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      {projectId && (
        <DeleteBranchesDialog
          projectId={projectId}
          branchNames={Array.from(selected)}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={handleDeleted}
        />
      )}
    </PageShell>
  )
}
