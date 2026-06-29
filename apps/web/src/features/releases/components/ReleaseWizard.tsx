import { useState, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  GitBranch,
  GitCommit,
  Loader2,
  Plus,
  Rocket,
  Tag,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { slideUp } from '@/lib/animations'
import { GITHUB_BRANCHES, COMPARE_REFS } from '../graphql/releases.queries'
import { CREATE_RELEASE } from '../graphql/releases.mutations'
import { BranchCombobox } from './BranchCombobox'
import { CreateBranchDialog } from './CreateBranchDialog'
import { WizardStepper } from './WizardStepper'
import type { RefCommitType } from '@/generated/graphql'

const STEP_KEYS = [
  'wizard.steps.branches',
  'wizard.steps.diff',
  'wizard.steps.create',
] as const

interface WizardState {
  baseRef: string
  compareRef: string
  tags: string[]
}

export function ReleaseWizard() {
  const { t } = useTranslation('releases')
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()
  const tagInputId = useId()

  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>({ baseRef: '', compareRef: '', tags: [] })
  const [createBranchOpen, setCreateBranchOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const projectId = activeProject?.id ?? ''

  const { data: branchesData, loading: branchesLoading } = useQuery(GITHUB_BRANCHES, {
    variables: { projectId },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  })

  const [runCompare, { data: compareData, loading: comparing, error: compareError }] =
    useLazyQuery(COMPARE_REFS, { fetchPolicy: 'network-only' })

  const [createRelease, { loading: creating }] = useMutation(CREATE_RELEASE)

  const branches = branchesData?.githubBranches ?? []
  const comparison = compareData?.compareRefs ?? null

  function handleStep1Continue() {
    if (!state.baseRef || !state.compareRef) return
    runCompare({
      variables: { projectId, baseRef: state.baseRef, compareRef: state.compareRef },
    })
    setStep(2)
  }

  function handleStep2Continue() {
    if (!comparison || comparison.aheadBy < 1) return
    setStep(3)
  }

  async function handleCreate() {
    if (!projectId) return
    try {
      const { data } = await createRelease({
        variables: {
          input: {
            projectId,
            baseRef: state.baseRef,
            compareRef: state.compareRef,
            tags: state.tags,
          },
        },
      })
      if (data) {
        navigate(ROUTES.RELEASE_DETAIL.replace(':releaseId', data.createRelease.id))
      }
    } catch {
      toast.error(t('wizard.createError'))
    }
  }

  function addTag() {
    const trimmed = tagInput.trim()
    if (!trimmed || state.tags.includes(trimmed)) {
      setTagInput('')
      return
    }
    setState((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }))
    setTagInput('')
  }

  function removeTag(tag: string) {
    setState((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const step1Valid = Boolean(state.baseRef) && Boolean(state.compareRef)
  const diffGated = comparison !== null && comparison.aheadBy < 1

  return (
    <div className="space-y-6">
      <WizardStepper currentStep={step} totalSteps={3} stepKeys={[...STEP_KEYS]} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={slideUp}
            initial={reduceMotion ? 'visible' : 'hidden'}
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <Step1
              branches={branches}
              branchesLoading={branchesLoading}
              baseRef={state.baseRef}
              compareRef={state.compareRef}
              onBaseChange={(v) => setState((prev) => ({ ...prev, baseRef: v }))}
              onCompareChange={(v) => setState((prev) => ({ ...prev, compareRef: v }))}
              onCreateBranch={() => setCreateBranchOpen(true)}
            />
            <div className="mt-6 flex justify-end">
              <GradientButton onClick={handleStep1Continue} disabled={!step1Valid}>
                {t('wizard.next')}
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </GradientButton>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            variants={slideUp}
            initial={reduceMotion ? 'visible' : 'hidden'}
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <Step2
              comparing={comparing}
              error={compareError?.message ?? null}
              comparison={comparison}
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 size-4" aria-hidden />
                {t('wizard.back')}
              </Button>
              <GradientButton
                onClick={handleStep2Continue}
                disabled={comparing || diffGated || !!compareError}
              >
                {t('wizard.next')}
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </GradientButton>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            variants={slideUp}
            initial={reduceMotion ? 'visible' : 'hidden'}
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <Step3
              baseRef={state.baseRef}
              compareRef={state.compareRef}
              tags={state.tags}
              tagInput={tagInput}
              tagInputId={tagInputId}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 size-4" aria-hidden />
                {t('wizard.back')}
              </Button>
              <GradientButton onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                <Rocket className="mr-2 size-4" aria-hidden />
                {creating ? t('wizard.creating') : t('wizard.createLabel')}
              </GradientButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateBranchDialog
        open={createBranchOpen}
        onOpenChange={setCreateBranchOpen}
        projectId={projectId}
        branches={branches}
        defaultFromRef={state.baseRef}
        onCreated={(name) => setState((prev) => ({ ...prev, compareRef: name }))}
      />
    </div>
  )
}

interface Step1Props {
  branches: Array<{ name: string; protected: boolean; commitSha: string }>
  branchesLoading: boolean
  baseRef: string
  compareRef: string
  onBaseChange: (v: string) => void
  onCompareChange: (v: string) => void
  onCreateBranch: () => void
}

function Step1({
  branches,
  branchesLoading,
  baseRef,
  compareRef,
  onBaseChange,
  onCompareChange,
  onCreateBranch,
}: Step1Props) {
  const { t } = useTranslation('releases')

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
          <GitBranch className="size-4 text-indigo-400" aria-hidden />
          {t('wizard.steps.branches')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {branchesLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('wizard.branches.loading')}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="base-branch">{t('wizard.branches.base')}</Label>
            <BranchCombobox
              id="base-branch"
              branches={branches}
              value={baseRef}
              onChange={onBaseChange}
              placeholder={t('wizard.branches.basePlaceholder')}
              disabled={branchesLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compare-branch">{t('wizard.branches.compare')}</Label>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <BranchCombobox
                  id="compare-branch"
                  branches={branches}
                  value={compareRef}
                  onChange={onCompareChange}
                  placeholder={t('wizard.branches.comparePlaceholder')}
                  disabled={branchesLoading}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onCreateBranch}
                aria-label={t('wizard.createBranch.triggerLabel')}
                className="shrink-0"
              >
                <Plus className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  )
}

interface Step2Props {
  comparing: boolean
  error: string | null
  comparison: {
    aheadBy: number
    behindBy: number
    totalCommits: number
    commits: RefCommitType[]
  } | null
}

function Step2({ comparing, error, comparison }: Step2Props) {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()

  if (comparing) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="size-10 animate-spin text-indigo-400" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('wizard.diff.comparing')}</p>
        </CardContent>
      </GlassCard>
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
              {t('wizard.diff.errorHeading')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t('wizard.diff.errorDescription')}</p>
          </div>
        </CardContent>
      </GlassCard>
    )
  }

  if (!comparison) return null

  const gated = comparison.aheadBy < 1

  return (
    <GlassCard glow={gated ? 'none' : 'indigo'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
          <GitCommit className="size-4 text-indigo-400" aria-hidden />
          {t('wizard.diff.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/5 px-4 py-3">
          <Stat label={t('wizard.diff.aheadBy')} value={comparison.aheadBy} highlight={!gated} />
          <Stat label={t('wizard.diff.behindBy')} value={comparison.behindBy} />
          <Stat label={t('wizard.diff.total')} value={comparison.totalCommits} />
        </div>

        {gated && (
          <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
            <p className="text-sm text-amber-200">{t('wizard.diff.gateMessage')}</p>
          </div>
        )}

        {comparison.commits.length > 0 && (
          <motion.ul
            variants={
              reduceMotion
                ? undefined
                : { visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }
            }
            initial="hidden"
            animate="visible"
            className="space-y-2"
            role="list"
            aria-label={t('wizard.diff.commitListLabel')}
          >
            {comparison.commits.map((commit) => (
              <CommitListItem key={commit.sha} commit={commit} />
            ))}
          </motion.ul>
        )}
      </CardContent>
    </GlassCard>
  )
}

interface StatProps {
  label: string
  value: number
  highlight?: boolean
}

function Stat({ label, value, highlight }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={
          highlight
            ? 'font-mono text-xl font-bold text-indigo-300'
            : 'font-mono text-xl font-bold text-foreground'
        }
      >
        {value}
      </span>
    </div>
  )
}

interface CommitListItemProps {
  commit: RefCommitType
}

function CommitListItem({ commit }: CommitListItemProps) {
  const reduceMotion = useReducedMotion()
  const shortSha = commit.sha.slice(0, 7)
  const formattedDate = new Date(commit.committedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <motion.li
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }
      }
      className="flex items-start gap-3 rounded-[var(--radius-card)] border border-white/5 bg-white/3 px-4 py-3"
    >
      <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400/60" aria-hidden />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm text-foreground/90">{commit.message}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-mono">{shortSha}</span>
          <span className="text-foreground/70">{commit.author}</span>
          <time dateTime={commit.committedAt}>{formattedDate}</time>
        </div>
      </div>
    </motion.li>
  )
}

interface Step3Props {
  baseRef: string
  compareRef: string
  tags: string[]
  tagInput: string
  tagInputId: string
  onTagInputChange: (v: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}

function Step3({
  baseRef,
  compareRef,
  tags,
  tagInput,
  tagInputId,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: Step3Props) {
  const { t } = useTranslation('releases')

  return (
    <GlassCard glow="magenta">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
          <Rocket className="size-4 text-pink-400" aria-hidden />
          {t('wizard.steps.create')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">{t('wizard.create.refsLabel')}</p>
          <p className="mt-1 font-mono text-sm text-foreground">
            {baseRef}
            <span className="mx-2 text-muted-foreground">→</span>
            {compareRef}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={tagInputId} className="flex items-center gap-1.5">
            <Tag className="size-3.5 text-muted-foreground" aria-hidden />
            {t('wizard.create.tags')}
          </Label>
          <div className="flex gap-2">
            <Input
              id={tagInputId}
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddTag()
                }
              }}
              placeholder={t('wizard.create.tagPlaceholder')}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAddTag}
              disabled={!tagInput.trim()}
              aria-label={t('wizard.create.addTag')}
              className="shrink-0"
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1" role="list" aria-label={t('wizard.create.tagsLabel')}>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  role="listitem"
                  className="flex items-center gap-1.5 rounded-full border-border/60 bg-muted px-3 py-1 text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    aria-label={t('wizard.create.removeTag', { tag })}
                    className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </GlassCard>
  )
}
