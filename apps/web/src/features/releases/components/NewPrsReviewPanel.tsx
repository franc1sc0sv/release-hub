import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import { Bot, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Action, Subject } from '@release-hub/shared'
import { Can } from '@/context/ability.context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { PrAssignmentRow } from './PrAssignmentRow'
import { CONFIRM_RELEASE_ADDITIONS } from '../graphql/releases.mutations'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'
import { AiDraftStatusValue } from '../constants/release-enums'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type FeatureNode = FeatureNodes[number]
type PrNode = FeatureNode['prs'][number]

interface NewPrsReviewPanelProps {
  release: ReleaseNode
  features: FeatureNodes
  projectId: string
}

export function NewPrsReviewPanel({ release, features, projectId }: NewPrsReviewPanelProps) {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()

  const pendingGroups = useMemo(
    () =>
      features
        .map((node) => ({
          feature: node.feature,
          prs: node.prs.filter((pr) => pr.pendingAddition),
        }))
        .filter((group) => group.prs.length > 0),
    [features],
  )

  const pendingPrs = useMemo(
    () => pendingGroups.flatMap((group) => group.prs),
    [pendingGroups],
  )

  const [confirmAdditions, { loading: confirming }] = useMutation(CONFIRM_RELEASE_ADDITIONS, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: release.id } }],
  })

  const handleConfirm = useCallback(async () => {
    try {
      await confirmAdditions({ variables: { releaseId: release.id } })
      toast.success(t('resync.confirmSuccess'))
    } catch {
      toast.error(t('resync.confirmError'))
    }
  }, [confirmAdditions, release.id, t])

  const isDrafting =
    release.aiDraftStatus === AiDraftStatusValue.PENDING ||
    release.aiDraftStatus === AiDraftStatusValue.RUNNING

  if (pendingPrs.length === 0) return null

  if (isDrafting) {
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

  const allPendingAssigned = pendingPrs.every((pr) => Boolean(pr.featureId))

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-[var(--radius-card)] border border-indigo-500/20 bg-indigo-500/5 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-foreground">
          {t('resync.panelHeading')}
        </h2>
        <Can I={Action.UPDATE} a={Subject.RELEASE}>
          <Button
            size="sm"
            disabled={!allPendingAssigned || confirming}
            onClick={handleConfirm}
            className="bg-primary text-white shadow-glow-indigo hover:shadow-glow-lg disabled:opacity-50"
          >
            {confirming ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                {t('resync.confirming')}
              </>
            ) : (
              t('resync.confirmButton')
            )}
          </Button>
        </Can>
      </div>

      <div className="space-y-3">
        {pendingGroups.map((group) => (
          <PendingFeatureGroup
            key={group.feature.id}
            feature={group.feature}
            prs={group.prs}
            releaseId={release.id}
            projectId={projectId}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface PendingFeatureGroupProps {
  feature: FeatureNode['feature']
  prs: PrNode[]
  releaseId: string
  projectId: string
}

function PendingFeatureGroup({ feature, prs, releaseId, projectId }: PendingFeatureGroupProps) {
  const { t } = useTranslation('releases')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm font-semibold text-foreground">
          {feature.name}
        </span>
        {feature.suggested && (
          <Badge className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
            <Sparkles className="mr-1 size-3" aria-hidden />
            {t('view.feature.suggested')}
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        {prs.map((pr) => (
          <PrAssignmentRow
            key={pr.id}
            pr={pr}
            featureName={feature.name}
            releaseId={releaseId}
            projectId={projectId}
          />
        ))}
      </div>
    </div>
  )
}
