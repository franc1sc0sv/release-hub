import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { formatDistanceToNow, type Locale } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { AlertCircle, Eraser, Loader2, Search, ShieldCheck, Trash2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { BranchCleanupPlanDeletableType, BranchCleanupPlanKeptType } from '@/generated/graphql'
import { DELETE_GITHUB_BRANCHES } from '../graphql/repo-ops.mutations'
import { useBranchCleanupPlan } from '../hooks/use-branch-cleanup-plan'
import { BranchReasonChips } from './BranchReasonChips'

const CONFIRMATION_WORD = 'DELETE'
const DELETE_CHUNK_SIZE = 25

const CleanAllStep = {
  REVIEW: 'review',
  CONFIRM: 'confirm',
  RUNNING: 'running',
  DONE: 'done',
} as const

type CleanAllStepValue = (typeof CleanAllStep)[keyof typeof CleanAllStep]

const CleanAllTab = {
  DELETE: 'delete',
  KEPT: 'kept',
} as const

type CleanAllTabValue = (typeof CleanAllTab)[keyof typeof CleanAllTab]

interface IDeleteOutcome {
  branchName: string
  deleted: boolean
  reason: string | null
}

interface CleanAllBranchesDialogProps {
  projectId: string
  onCompleted: () => void
}

function chunkNames(names: string[], size: number): string[][] {
  const chunks: string[][] = []
  for (let index = 0; index < names.length; index += size) {
    chunks.push(names.slice(index, index + size))
  }
  return chunks
}

function authorInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

export function CleanAllBranchesDialog({ projectId, onCompleted }: CleanAllBranchesDialogProps) {
  const { t, i18n } = useTranslation('repoOps')
  const locale = i18n.language.startsWith('es') ? es : enUS

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<CleanAllStepValue>(CleanAllStep.REVIEW)
  const [tab, setTab] = useState<CleanAllTabValue>(CleanAllTab.DELETE)
  const [deleteFilter, setDeleteFilter] = useState('')
  const [keptFilter, setKeptFilter] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [progress, setProgress] = useState(0)
  const [outcomes, setOutcomes] = useState<IDeleteOutcome[]>([])

  const { plan, loading, error } = useBranchCleanupPlan(projectId, open)
  const [deleteBranches] = useMutation(DELETE_GITHUB_BRANCHES)

  const deletable = plan?.deletable ?? []
  const kept = plan?.kept ?? []
  const isRunning = step === CleanAllStep.RUNNING

  const filteredDeletable = useMemo(() => {
    const needle = deleteFilter.trim().toLowerCase()
    return needle ? deletable.filter((branch) => branch.name.toLowerCase().includes(needle)) : deletable
  }, [deletable, deleteFilter])

  const filteredKept = useMemo(() => {
    const needle = keptFilter.trim().toLowerCase()
    return needle ? kept.filter((branch) => branch.name.toLowerCase().includes(needle)) : kept
  }, [kept, keptFilter])

  function resetAndClose(nextOpen: boolean) {
    if (isRunning) return
    setOpen(nextOpen)
    if (!nextOpen) {
      const finished = step === CleanAllStep.DONE
      setStep(CleanAllStep.REVIEW)
      setTab(CleanAllTab.DELETE)
      setDeleteFilter('')
      setKeptFilter('')
      setConfirmation('')
      setProgress(0)
      setOutcomes([])
      if (finished) onCompleted()
    }
  }

  async function runDeletion() {
    setStep(CleanAllStep.RUNNING)
    const names = deletable.map((branch) => branch.name)
    const collected: IDeleteOutcome[] = []
    try {
      for (const chunk of chunkNames(names, DELETE_CHUNK_SIZE)) {
        const result = await deleteBranches({
          variables: { input: { projectId, branchNames: chunk, overriddenBranchNames: [] } },
        })
        collected.push(...(result.data?.deleteGithubBranches ?? []))
        setProgress(collected.length)
      }
    } catch {
      toast.error(t('cleanAll.executionError'))
    }
    setOutcomes(collected)
    setStep(CleanAllStep.DONE)
  }

  const deletedCount = outcomes.filter((outcome) => outcome.deleted).length
  const refused = outcomes.filter((outcome) => !outcome.deleted)

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
            <Eraser className="size-4" aria-hidden />
            {t('cleanAll.trigger')}
          </Button>
        }
      />
      <DialogContent className="flex h-[85vh] max-h-[85vh] w-full flex-col gap-4 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('cleanAll.title')}</DialogTitle>
          <DialogDescription>{t('cleanAll.description')}</DialogDescription>
        </DialogHeader>

        {step === CleanAllStep.REVIEW && loading && (
          <div className="flex flex-1 items-center justify-center gap-3">
            <Loader2 className="size-5 animate-spin text-brand-indigo-bright" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('cleanAll.loading')}</p>
          </div>
        )}

        {step === CleanAllStep.REVIEW && !loading && error && (
          <div className="flex flex-1 items-center justify-center gap-3">
            <AlertCircle className="size-5 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('cleanAll.error')}</p>
          </div>
        )}

        {step === CleanAllStep.REVIEW && !loading && !error && plan && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-[var(--radius-button)] bg-destructive/15 px-3 py-1.5 font-mono text-sm text-destructive">
                {t('cleanAll.deletableCount', { count: deletable.length })}
              </span>
              <span className="rounded-[var(--radius-button)] bg-brand-indigo-bright/10 px-3 py-1.5 font-mono text-sm text-foreground">
                {t('cleanAll.keptCount', { count: kept.length })}
              </span>
              <span className="text-sm text-muted-foreground">
                {t('cleanAll.totalLabel', { total: plan.totalCount })}
              </span>
            </div>

            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as CleanAllTabValue)}
              className="min-h-0 flex-1"
            >
              <TabsList className="w-full">
                <TabsTrigger value={CleanAllTab.DELETE}>
                  <Trash2 className="size-4" aria-hidden />
                  {t('cleanAll.tabs.delete', { count: deletable.length })}
                </TabsTrigger>
                <TabsTrigger value={CleanAllTab.KEPT}>
                  <ShieldCheck className="size-4" aria-hidden />
                  {t('cleanAll.tabs.kept', { count: kept.length })}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={CleanAllTab.DELETE} className="flex min-h-0 flex-col gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    value={deleteFilter}
                    onChange={(event) => setDeleteFilter(event.target.value)}
                    placeholder={t('cleanAll.searchDelete')}
                    className="pl-9"
                  />
                </div>
                {deletable.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center gap-3">
                    <ShieldCheck className="size-5 text-emerald-400" aria-hidden />
                    <p className="text-sm text-muted-foreground">{t('cleanAll.nothingToDelete')}</p>
                  </div>
                ) : (
                  <ScrollArea className="min-h-0 flex-1 rounded-[var(--radius-card)] border border-border/60">
                    <div className="divide-y divide-border/40">
                      {filteredDeletable.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">{t('cleanAll.noMatches')}</p>
                      ) : (
                        filteredDeletable.map((branch) => (
                          <DeletableRow
                            key={branch.name}
                            branch={branch}
                            locale={locale}
                            noActivityLabel={t('cleanAll.noActivity')}
                            unknownAuthorLabel={t('cleanAll.unknownAuthor')}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value={CleanAllTab.KEPT} className="flex min-h-0 flex-col gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    value={keptFilter}
                    onChange={(event) => setKeptFilter(event.target.value)}
                    placeholder={t('cleanAll.searchKept')}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="min-h-0 flex-1 rounded-[var(--radius-card)] border border-border/60">
                  <div className="divide-y divide-border/40">
                    {filteredKept.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">{t('cleanAll.noMatches')}</p>
                    ) : (
                      filteredKept.map((branch) => <KeptRow key={branch.name} branch={branch} />)
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="ghost" onClick={() => resetAndClose(false)}>
                {t('cleanAll.cancel')}
              </Button>
              <Button
                variant="destructive"
                disabled={deletable.length === 0}
                onClick={() => setStep(CleanAllStep.CONFIRM)}
              >
                {t('cleanAll.continue')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === CleanAllStep.CONFIRM && (
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-destructive/40 bg-destructive/10 p-4">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
              <p className="text-sm text-foreground">
                {t('cleanAll.confirmWarning', { count: deletable.length })}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clean-all-confirmation">
                {t('cleanAll.confirmationLabel', { word: CONFIRMATION_WORD })}
              </Label>
              <Input
                id="clean-all-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep(CleanAllStep.REVIEW)}>
                {t('cleanAll.back')}
              </Button>
              <Button
                variant="destructive"
                className="gap-1.5"
                disabled={confirmation !== CONFIRMATION_WORD}
                onClick={() => void runDeletion()}
              >
                <Trash2 className="size-4" aria-hidden />
                {t('cleanAll.confirmAction', { count: deletable.length })}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === CleanAllStep.RUNNING && (
          <div className="flex flex-1 flex-col justify-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('cleanAll.runningLabel', { done: progress, total: deletable.length })}
            </p>
            <Progress value={deletable.length === 0 ? 0 : (progress / deletable.length) * 100} />
          </div>
        )}

        {step === CleanAllStep.DONE && (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <p className="text-sm text-foreground">{t('cleanAll.doneDeleted', { count: deletedCount })}</p>
              {refused.length > 0 && (
                <>
                  <p className="text-sm text-destructive">{t('cleanAll.doneRefused', { count: refused.length })}</p>
                  <ScrollArea className="min-h-0 flex-1 rounded-[var(--radius-card)] border border-border/60">
                    <div className="divide-y divide-border/40">
                      {refused.map((outcome) => (
                        <div key={outcome.branchName} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5">
                          <span className="font-mono text-sm text-foreground">{outcome.branchName}</span>
                          <span className="text-xs text-muted-foreground">{outcome.reason}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => resetAndClose(false)}>{t('cleanAll.close')}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface DeletableRowProps {
  branch: BranchCleanupPlanDeletableType
  locale: Locale
  noActivityLabel: string
  unknownAuthorLabel: string
}

function DeletableRow({ branch, locale, noActivityLabel, unknownAuthorLabel }: DeletableRowProps) {
  const authorName = branch.lastCommitAuthorLogin ?? branch.lastCommitAuthorName

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="truncate font-mono text-sm text-foreground">{branch.name}</span>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {branch.lastCommitAt
            ? formatDistanceToNow(new Date(branch.lastCommitAt), { addSuffix: true, locale })
            : noActivityLabel}
        </span>
        {authorName ? (
          <div className="flex items-center gap-1.5">
            <Avatar size="sm">
              {branch.lastCommitAuthorAvatarUrl && (
                <AvatarImage src={branch.lastCommitAuthorAvatarUrl} alt={authorName} />
              )}
              <AvatarFallback>{authorInitials(authorName)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{authorName}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{unknownAuthorLabel}</span>
        )}
      </div>
    </div>
  )
}

interface KeptRowProps {
  branch: BranchCleanupPlanKeptType
}

function KeptRow({ branch }: KeptRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2.5">
      <span className="truncate font-mono text-sm text-muted-foreground">{branch.name}</span>
      <BranchReasonChips blockReasons={branch.blockReasons} />
    </div>
  )
}
