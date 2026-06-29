import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { Loader2, LayoutGrid } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Can, useAbility } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useFeatures, type FeatureItem } from '../hooks/useFeatures'
import { FeatureKindValue } from '../constants/feature-enums'
import { ASSIGN_PR_TO_FEATURE } from '../graphql/features.mutations'
import { LIST_FEATURES } from '../graphql/features.queries'
import { GET_COVERAGE } from '@/features/releases/graphql/releases.queries'
import { useSuggestFeature } from '@/features/releases/hooks/useSuggestFeature'
import { FeatureLane } from './FeatureLane'
import { CreateFeatureDialog } from './CreateFeatureDialog'
import { type PrItem } from './PrCard'
import type { DiffRefsQuery } from '@/generated/graphql'
import { useProject } from '@/context/project.context'

type BoardPrItem = DiffRefsQuery['diffRefs'][number]

interface FeatureBoardProps {
  prs: BoardPrItem[]
  releaseId?: string
}

function getLaneIdAtPoint(x: number, y: number): string | null {
  const elements = document.elementsFromPoint(x, y)
  for (const el of elements) {
    const laneId = (el as HTMLElement).dataset?.laneId
    if (laneId !== undefined) return laneId
  }
  return null
}

export function FeatureBoard({ prs, releaseId }: FeatureBoardProps) {
  const { t } = useTranslation('features')
  const { activeProject } = useProject()
  const { features, loading, error } = useFeatures()

  const ability = useAbility()
  const canAssign = ability.can(Action.UPDATE, Subject.PULL_REQUEST)

  const [draggingPr, setDraggingPr] = useState<PrItem | null>(null)
  const [hoveredLaneId, setHoveredLaneId] = useState<string | null>(null)
  const [localFeatureIds, setLocalFeatureIds] = useState<Record<string, string | null>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [suggestingPrId, setSuggestingPrId] = useState<string | null>(null)

  const { state: suggestState, suggest, reset: resetSuggest } = useSuggestFeature()

  const coverageRefetch = releaseId
    ? [{ query: GET_COVERAGE, variables: { releaseId } }]
    : []

  const [assignPrToFeature] = useMutation(ASSIGN_PR_TO_FEATURE, {
    refetchQueries: [
      {
        query: LIST_FEATURES,
        variables: { projectId: activeProject?.id ?? '' },
      },
      ...coverageRefetch,
    ],
  })

  const getEffectiveFeatureId = useCallback(
    (pr: BoardPrItem): string | null => {
      if (pr.id in localFeatureIds) return localFeatureIds[pr.id]
      return pr.featureId ?? null
    },
    [localFeatureIds],
  )

  const effectivePrs: PrItem[] = prs.map((pr) => ({
    ...pr,
    featureId: getEffectiveFeatureId(pr),
  }))

  async function handleAssign(pr: PrItem, featureId: string | null) {
    const previousFeatureId = getEffectiveFeatureId(pr)
    if (previousFeatureId === featureId) return

    setLocalFeatureIds((prev) => ({ ...prev, [pr.id]: featureId }))

    try {
      await assignPrToFeature({
        variables: {
          input: {
            prId: pr.id,
            featureId: featureId ?? '',
          },
        },
      })

      const feature = features.find((f) => f.id === featureId)
      toast.success(t('toast.assigned', { number: pr.number, feature: feature?.name ?? '' }))
    } catch {
      setLocalFeatureIds((prev) => ({ ...prev, [pr.id]: previousFeatureId }))
      toast.error(t('toast.assignError'))
    }
  }

  function handleSuggest(prId: string) {
    setSuggestingPrId(prId)
    suggest(prId)
  }

  useEffect(() => {
    if (suggestState.status === 'idle' || suggestState.status === 'loading') return

    if (suggestState.status === 'error') {
      toast.error(t('prCard.suggestError'))
      setSuggestingPrId(null)
      resetSuggest()
      return
    }

    const pr = suggestingPrId ? prs.find((p) => p.id === suggestingPrId) : undefined
    const feature = features.find((f) => f.id === suggestState.featureId)

    if (pr && feature) {
      handleAssign(pr, feature.id)
      toast.success(
        t('prCard.suggestApplied', {
          name: feature.name,
          confidence: Math.round(suggestState.confidence * 100),
        }),
      )
    } else {
      toast.error(t('prCard.suggestError'))
    }

    setSuggestingPrId(null)
    resetSuggest()
  }, [suggestState])

  function handleDragStart(pr: PrItem) {
    setDraggingPr(pr)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingPr) return
    const laneId = getLaneIdAtPoint(e.clientX, e.clientY)
    setHoveredLaneId(laneId)
  }

  function handleDragEnd(pr: PrItem, point: { x: number; y: number }) {
    const laneId = getLaneIdAtPoint(point.x, point.y)
    setDraggingPr(null)
    setHoveredLaneId(null)

    if (laneId === null) return
    const featureId = laneId === '__unassigned__' ? null : laneId
    handleAssign(pr, featureId)
  }

  if (loading) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="size-8 animate-spin text-indigo-400" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </GlassCard>
    )
  }

  if (error) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <LayoutGrid className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('error.description')}</p>
        </CardContent>
      </GlassCard>
    )
  }

  const defaultFeatures = features.filter((f) => f.kind === FeatureKindValue.DEFAULT)
  const productFeatures = features.filter((f) => f.kind === FeatureKindValue.PRODUCT)

  const unassignedPrs = effectivePrs.filter((pr) => !pr.featureId)
  const getPrsForFeature = (f: FeatureItem) =>
    effectivePrs.filter((pr) => pr.featureId === f.id)

  const isDropTarget = (laneId: string) =>
    hoveredLaneId === laneId && draggingPr !== null

  return (
    <section
      aria-label={t('title')}
      className="space-y-6"
      onPointerMove={handlePointerMove}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-overline uppercase tracking-widest text-muted-foreground">
            {t('subtitle')}
          </p>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            {t('title')}
          </h2>
        </div>
        <Can I={Action.CREATE} a={Subject.FEATURE}>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white shadow-glow-indigo transition-shadow duration-300 hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('new')}
          </button>
        </Can>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        <motion.div variants={slideUp}>
          <FeatureLane
            feature={null}
            prs={unassignedPrs}
            allFeatures={features}
            draggingPr={draggingPr}
            isDropTarget={isDropTarget('__unassigned__')}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onAssign={handleAssign}
            assignable={canAssign}
            onSuggest={handleSuggest}
            suggestingPrId={suggestingPrId}
          />
        </motion.div>

        {defaultFeatures.map((f) => (
          <motion.div key={f.id} variants={slideUp}>
            <FeatureLane
              feature={f}
              prs={getPrsForFeature(f)}
              allFeatures={features}
              draggingPr={draggingPr}
              isDropTarget={isDropTarget(f.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onAssign={handleAssign}
              assignable={canAssign}
              onSuggest={handleSuggest}
              suggestingPrId={suggestingPrId}
            />
          </motion.div>
        ))}

        {productFeatures.map((f) => (
          <motion.div key={f.id} variants={slideUp}>
            <FeatureLane
              feature={f}
              prs={getPrsForFeature(f)}
              allFeatures={features}
              draggingPr={draggingPr}
              isDropTarget={isDropTarget(f.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onAssign={handleAssign}
              assignable={canAssign}
              onSuggest={handleSuggest}
              suggestingPrId={suggestingPrId}
            />
          </motion.div>
        ))}
      </motion.div>

      <CreateFeatureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  )
}
