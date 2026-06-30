import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  GitMerge,
  Layers,
  Loader2,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { CommitRow } from './CommitRow'
import { TicketChip } from './TicketChip'
import { CoverageMeter } from './CoverageMeter'
import { PrSummaryPanel } from './PrSummaryPanel'
import { RegenerateDraftButton } from './RegenerateDraftButton'
import { slideUp, staggerContainer } from '@/lib/animations'
import { LIST_FEATURES } from '@/features/features/graphql/features.queries'
import {
  UPDATE_RELEASE,
  CONFIRM_RELEASE,
  ACCEPT_SUGGESTED_FEATURE,
  REJECT_SUGGESTED_FEATURE,
} from '../graphql/releases.mutations'
import { GET_RELEASE_TREE, GET_COVERAGE } from '../graphql/releases.queries'
import { AiDraftStatusValue } from '../constants/release-enums'
import { FeatureKindValue } from '@/features/features/constants/feature-enums'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type FeatureNode = FeatureNodes[number]
type PrNode = FeatureNode['prs'][number]

interface DraftTabProps {
  release: ReleaseNode
  features: FeatureNodes
  projectId: string
}

export function DraftTab({ release, features, projectId }: DraftTabProps) {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()

  const isDrafting =
    release.aiDraftStatus === AiDraftStatusValue.PENDING ||
    release.aiDraftStatus === AiDraftStatusValue.RUNNING

  const isReady = release.aiDraftStatus === AiDraftStatusValue.READY

  const [confirmRelease, { loading: confirming, data: confirmData, error: confirmError }] =
    useMutation(CONFIRM_RELEASE)

  const { data: coverageData } = useQuery(GET_COVERAGE, {
    variables: { releaseId: release.id },
    fetchPolicy: 'cache-and-network',
  })

  const coverageReady = coverageData?.getCoverage?.ready ?? false

  const handleConfirm = useCallback(async () => {
    try {
      await confirmRelease({ variables: { input: { releaseId: release.id } } })
    } catch {
      toast.error(t('draft.confirmError'))
    }
  }, [confirmRelease, release.id, t])

  if (isDrafting) {
    return <DraftingState reduceMotion={reduceMotion ?? false} />
  }

  const suggestedFeatures = features.filter((n) => n.feature.suggested)
  const assignedFeatures = features.filter((n) => !n.feature.suggested)

  return (
    <motion.div
      variants={staggerContainer}
      initial={reduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={slideUp} className="flex items-center justify-between gap-3">
        <RegenerateDraftButton
          releaseId={release.id}
          aiDraftStatus={release.aiDraftStatus}
        />
        <Button
          size="sm"
          disabled={!coverageReady || confirming || Boolean(confirmData)}
          onClick={handleConfirm}
          className="bg-primary text-white shadow-glow-indigo hover:shadow-glow-lg disabled:opacity-50"
        >
          {confirming ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
              {t('draft.confirming')}
            </>
          ) : (
            <>
              <Rocket className="mr-1.5 size-3.5" aria-hidden />
              {t('draft.confirm')}
            </>
          )}
        </Button>
      </motion.div>

      {confirmData?.confirmRelease?.prUrl && (
        <motion.div
          variants={slideUp}
          className="flex items-center gap-2 rounded-[var(--radius-card)] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          role="status"
        >
          <Check className="size-4 shrink-0 text-emerald-400" aria-hidden />
          <span className="text-sm text-emerald-300">{t('draft.confirmed')}</span>
          <a
            href={confirmData.confirmRelease.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-emerald-300 underline underline-offset-2 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('view.prUrl')}
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </motion.div>
      )}

      {confirmError && (
        <p className="text-sm text-destructive" role="alert">
          {t('draft.confirmError')}
        </p>
      )}

      <motion.div variants={slideUp}>
        <CoverageMeter releaseId={release.id} releaseStatus={release.status} />
      </motion.div>

      {suggestedFeatures.length > 0 && (
        <motion.div variants={slideUp} className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-fuchsia-400" aria-hidden />
            <h2 className="font-display text-base font-semibold text-foreground">
              {t('draft.suggested.heading')}
            </h2>
          </div>
          <div className="space-y-3">
            {suggestedFeatures.map((node) => (
              <SuggestedFeatureCard
                key={node.feature.id}
                node={node}
                releaseId={release.id}
                projectId={projectId}
              />
            ))}
          </div>
        </motion.div>
      )}

      {assignedFeatures.length > 0 && (
        <motion.div variants={slideUp} className="space-y-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            {t('draft.prsByFeature')}
          </h2>
          <div className="space-y-3">
            {assignedFeatures.map((node) => (
              <DraftFeatureSection
                key={node.feature.id}
                node={node}
                releaseId={release.id}
                projectId={projectId}
              />
            ))}
          </div>
        </motion.div>
      )}

      {features.length === 0 && isReady && (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
              <Rocket className="size-7 text-indigo-400" aria-hidden />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t('draft.noFeatures')}
            </p>
          </CardContent>
        </GlassCard>
      )}

    </motion.div>
  )
}

function DraftingState({ reduceMotion }: { reduceMotion: boolean }) {
  const { t } = useTranslation('releases')

  return (
    <GlassCard glow="indigo">
      <CardContent className="flex flex-col items-center gap-4 py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
          <motion.div
            animate={reduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Bot className="size-7 text-indigo-400" aria-hidden />
          </motion.div>
        </div>
        <div className="text-center" role="status" aria-live="polite">
          <p className="font-display text-lg font-semibold text-foreground">
            {t('draft.drafting.heading')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('draft.drafting.description')}
          </p>
        </div>
      </CardContent>
    </GlassCard>
  )
}

interface SuggestedFeatureCardProps {
  node: FeatureNode
  releaseId: string
  projectId: string
}

function SuggestedFeatureCard({ node, releaseId, projectId }: SuggestedFeatureCardProps) {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [rejected, setRejected] = useState(false)
  const [editedName, setEditedName] = useState(node.feature.name)
  const [editedDescription, setEditedDescription] = useState(node.feature.description ?? '')

  const [acceptFeature, { loading: accepting }] = useMutation(ACCEPT_SUGGESTED_FEATURE, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
  })

  const [rejectFeature, { loading: rejecting }] = useMutation(REJECT_SUGGESTED_FEATURE, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
  })

  const handleAccept = useCallback(async () => {
    try {
      await acceptFeature({
        variables: {
          input: {
            featureId: node.feature.id,
            name: editedName.trim() || node.feature.name,
            description: editedDescription.trim() || undefined,
            tags: undefined,
          },
        },
      })
      setAccepted(true)
    } catch {
      toast.error(t('draft.suggested.acceptError'))
    }
  }, [acceptFeature, node.feature.id, editedName, editedDescription, t])

  const handleReject = useCallback(async () => {
    try {
      await rejectFeature({ variables: { input: { featureId: node.feature.id } } })
      setRejected(true)
    } catch {
      toast.error(t('draft.suggested.rejectError'))
    }
  }, [rejectFeature, node.feature.id, t])

  if (accepted || rejected) return null

  const toggleLabel = open
    ? t('view.feature.collapseLabel', { name: node.feature.name })
    : t('view.feature.expandLabel', { name: node.feature.name })

  return (
    <div className="rounded-[var(--radius-card)] border border-fuchsia-500/20 bg-fuchsia-500/5 backdrop-blur-sm">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-fuchsia-500/30 bg-fuchsia-500/15">
          <Sparkles className="size-4 text-fuchsia-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-foreground">
              {node.feature.name}
            </span>
            <Badge className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
              {t('view.feature.suggested')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('draft.suggested.prCount', { count: node.prs.length })}
          </p>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 border border-rose-500/30 px-2.5 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
            onClick={handleReject}
            disabled={rejecting || accepting}
            aria-label={t('draft.suggested.rejectAriaLabel', { name: node.feature.name })}
          >
            <X className="mr-1 size-3" aria-hidden />
            {t('draft.suggested.reject')}
          </Button>
          <Button
            size="sm"
            className="h-7 bg-fuchsia-600 px-2.5 text-xs text-white hover:bg-fuchsia-500"
            onClick={handleAccept}
            disabled={accepting || rejecting}
            aria-label={t('draft.suggested.acceptAriaLabel', { name: node.feature.name })}
          >
            {accepting ? (
              <Loader2 className="mr-1 size-3 animate-spin" aria-hidden />
            ) : (
              <Check className="mr-1 size-3" aria-hidden />
            )}
            {t('draft.suggested.accept')}
          </Button>
          <button
            type="button"
            aria-expanded={open}
            aria-label={toggleLabel}
            onClick={() => setOpen((p) => !p)}
            className="flex shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <ChevronDown className="size-4" aria-hidden />
            </motion.span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-fuchsia-500/15 px-4 pb-4 pt-3 space-y-3">
          <div className="space-y-2">
            <label
              htmlFor={`suggested-name-${node.feature.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              {t('draft.suggested.nameLabel')}
            </label>
            <Input
              id={`suggested-name-${node.feature.id}`}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              maxLength={200}
              placeholder={t('draft.suggested.namePlaceholder')}
              className="h-8 bg-white/5 text-sm border-fuchsia-500/20 focus-visible:ring-fuchsia-500/40"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`suggested-description-${node.feature.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              {t('draft.suggested.descriptionLabel')}
            </label>
            <Textarea
              id={`suggested-description-${node.feature.id}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={t('draft.suggested.descriptionPlaceholder')}
              className="bg-white/5 text-sm resize-none border-fuchsia-500/20 focus-visible:ring-fuchsia-500/40"
            />
          </div>
          {node.prs.length > 0 && (
            <div className="space-y-3 pt-1">
              {node.prs.map((pr) => (
                <DraftPrRow
                  key={pr.id}
                  pr={pr}
                  featureName={editedName}
                  releaseId={releaseId}
                  projectId={projectId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface DraftFeatureSectionProps {
  node: FeatureNode
  releaseId: string
  projectId: string
}

function DraftFeatureSection({ node, releaseId, projectId }: DraftFeatureSectionProps) {
  const { t } = useTranslation('releases')
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()

  const toggleLabel = open
    ? t('view.feature.collapseLabel', { name: node.feature.name })
    : t('view.feature.expandLabel', { name: node.feature.name })

  const isDefault = node.feature.kind === FeatureKindValue.DEFAULT

  return (
    <div className="rounded-[var(--radius-card)] border border-white/12 bg-white/4 backdrop-blur-sm">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/15">
          <Layers className="size-4 text-indigo-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-foreground">
              {node.feature.name}
            </span>
            {isDefault && (
              <Badge className="rounded-full border border-slate-500/40 bg-slate-500/10 px-2 py-0.5 text-xs text-slate-400">
                {t('draft.defaultFeature')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('view.feature.prCount', { count: node.prs.length })}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={toggleLabel}
          onClick={() => setOpen((p) => !p)}
          className="mt-1 flex shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-4" aria-hidden />
          </motion.span>
        </button>
      </div>

      {open && node.prs.length > 0 && (
        <div className="space-y-3 border-t border-white/8 px-4 pb-4 pt-3">
          {node.prs.map((pr) => (
            <DraftPrRow
              key={pr.id}
              pr={pr}
              featureName={node.feature.name}
              releaseId={releaseId}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DraftPrRowProps {
  pr: PrNode
  featureName: string
  releaseId: string
  projectId: string
}

function DraftPrRow({ pr, featureName, releaseId, projectId }: DraftPrRowProps) {
  const { t } = useTranslation('releases')
  const [showCommits, setShowCommits] = useState(false)
  const reduceMotion = useReducedMotion()

  const { data: featuresData } = useQuery(LIST_FEATURES, {
    variables: { projectId },
    fetchPolicy: 'cache-first',
  })

  const [updateRelease, { loading: saving }] = useMutation(UPDATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
  })

  const handleFeatureChange = useCallback(
    async (value: string | null) => {
      if (!value) return
      try {
        await updateRelease({
          variables: {
            input: {
              releaseId,
              prAssignments: [{ pullRequestId: pr.id, featureId: value }],
              tags: undefined,
            },
          },
        })
      } catch {
        toast.error(t('draft.assignError'))
      }
    },
    [updateRelease, releaseId, pr.id, t],
  )

  const assignableFeatures = (featuresData?.listFeatures ?? []).filter(
    (f) => !f.suggested,
  )

  const confidenceLevel =
    pr.aiConfidence !== null && pr.aiConfidence !== undefined
      ? pr.aiConfidence >= 0.9
        ? 'high'
        : pr.aiConfidence >= 0.6
          ? 'medium'
          : 'low'
      : null

  const confidenceClass: Record<string, string> = {
    high: 'text-emerald-400',
    medium: 'text-amber-400',
    low: 'text-slate-400',
  }

  const formattedDate = new Date(pr.mergedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const toggleLabel = showCommits
    ? t('builder.pr.collapseCommits')
    : t('builder.pr.expandCommits')

  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
          <GitMerge className="size-3.5 text-indigo-400" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {pr.url ? (
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('builder.pr.openGitHub', { number: pr.number, title: pr.title })}
                className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-mono text-xs text-muted-foreground">#{pr.number}</span>
                <span className="truncate text-sm font-medium">{pr.title}</span>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : (
              <>
                <span className="font-mono text-xs text-muted-foreground">#{pr.number}</span>
                <p className="truncate text-sm font-medium text-foreground">{pr.title}</p>
              </>
            )}
            {pr.tickets.map((ticket) => (
              <TicketChip key={ticket.issueId} ticket={ticket} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {t('builder.pr.by')}{' '}
              <span className="text-foreground/70">{pr.author}</span>
            </span>
            <span>
              {t('builder.pr.mergedAt')}{' '}
              <time dateTime={pr.mergedAt}>{formattedDate}</time>
            </span>
            <span>{t('builder.pr.commitsCount', { count: pr.commits.length })}</span>
          </div>

          {pr.aiRationale && confidenceLevel && (
            <div className="flex items-start gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
              <Bot className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden />
              <div className="min-w-0 space-y-0.5">
                <span className={`text-xs font-medium ${confidenceClass[confidenceLevel]}`}>
                  {t(`draft.confidence.${confidenceLevel}`)}
                </span>
                <p className="text-xs text-muted-foreground">{pr.aiRationale}</p>
              </div>
            </div>
          )}

          <PrSummaryPanel pr={pr} />

          <div className="flex items-center gap-2">
            <label
              htmlFor={`feature-select-${pr.id}`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t('draft.assignTo')}
            </label>
            <Select
              value={pr.featureId ?? ''}
              onValueChange={handleFeatureChange}
              disabled={saving}
            >
              <SelectTrigger
                id={`feature-select-${pr.id}`}
                size="sm"
                className="h-7 min-w-0 flex-1 text-xs"
              >
                <SelectValue placeholder={t('draft.selectFeature')}>
                  {(value: string) =>
                    value
                      ? (assignableFeatures.find((f) => f.id === value)?.name ?? featureName)
                      : null
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {assignableFeatures.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs">
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {saving && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label={toggleLabel}
          aria-expanded={showCommits}
          onClick={() => setShowCommits((p) => !p)}
          className="mt-1 flex shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <motion.span
            animate={{ rotate: showCommits ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-4" aria-hidden />
          </motion.span>
        </button>
      </div>

      {showCommits && pr.commits.length > 0 && (
        <div className="space-y-2 border-t border-white/8 px-4 pb-3 pt-2">
          {pr.commits.map((commit) => (
            <CommitRow key={commit.sha} commit={commit} />
          ))}
        </div>
      )}
    </div>
  )
}
