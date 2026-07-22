import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { useParams, Link, generatePath } from 'react-router-dom'
import { m, useReducedMotion } from 'motion/react'
import { AlertCircle, Bot, Check, Loader2, RefreshCcw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { DisabledTooltip } from '@/components/DisabledTooltip'
import { isAiEnabled } from '@/lib/ai-availability'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
import { SummaryExportControls } from './SummaryExportControls'
import { SummaryDocument } from './SummaryDocument'
import { SAVE_RELEASE_SUMMARY, START_SUMMARY_GENERATION } from '../graphql/releases.mutations'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'
import { AiSummaryStatusValue } from '../constants/release-enums'
import { FeatureKindValue, FeatureStateValue } from '@/features/features/constants/feature-enums'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { useSummaryProfiles } from '@/features/summary-profiles/hooks/use-summary-profiles'
import type { FeatureState, GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type SummaryMode = 'read' | 'edit'

const AI_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5',
  'claude-opus-4-5',
] as const

type AiModel = (typeof AI_MODELS)[number]

const DEFAULT_MODEL: AiModel = 'claude-haiku-4-5-20251001'
const NONE_PROFILE_VALUE = 'none' as const

const UNRELEASED_STATES = new Set<string>([
  FeatureStateValue.IN_PROGRESS,
  FeatureStateValue.SHIPPED_FLAG_OFF,
  FeatureStateValue.BLOCKED,
])

function isExcludedFromSummary(kind: string, state: string): boolean {
  return kind === FeatureKindValue.PRODUCT && UNRELEASED_STATES.has(state)
}

function resolveFeatureState(node: FeatureNodes[number]): FeatureState {
  return node.feature.currentState ?? node.state
}

const RichTextEditor = lazy(() =>
  import('@/components/editor/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
)

interface SummaryTabProps {
  release: ReleaseNode
  features: FeatureNodes
}

function SummaryGeneratingState({ reduceMotion }: { reduceMotion: boolean }) {
  const { t } = useTranslation('releases')

  return (
    <GlassCard glow="indigo">
      <CardContent className="flex flex-col items-center gap-4 py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
          <m.div
            animate={reduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Bot className="size-7 text-indigo-400" aria-hidden />
          </m.div>
        </div>
        <div className="text-center" role="status" aria-live="polite">
          <p className="font-display text-lg font-semibold text-foreground">
            {t('summary.generating.heading')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('summary.generating.description')}
          </p>
        </div>
      </CardContent>
    </GlassCard>
  )
}

export function SummaryTab({ release, features }: SummaryTabProps) {
  const { t } = useTranslation('releases')
  const { t: tAi } = useTranslation('ai')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()
  const aiEnabled = isAiEnabled()
  const { organizationId } = useParams<{ organizationId: string }>()
  const { profiles } = useSummaryProfiles(release.projectId)

  const [mode, setMode] = useState<SummaryMode>('read')
  const [model, setModel] = useState<AiModel>(
    () => AI_MODELS.find((m) => m === release.summaryModel) ?? DEFAULT_MODEL,
  )
  const [profileId, setProfileId] = useState<string>(release.summaryProfileId ?? NONE_PROFILE_VALUE)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [editorContent, setEditorContent] = useState<string>(release.summary ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(release.summaryEditedAt ?? null)

  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of features) {
      if (
        node.feature.kind === FeatureKindValue.PRODUCT &&
        !isExcludedFromSummary(node.feature.kind, resolveFeatureState(node))
      ) {
        initial.add(node.feature.id)
      }
    }
    return initial
  })

  const [startGeneration, { loading: starting }] = useMutation(START_SUMMARY_GENERATION, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: release.id } }],
  })

  const [saveSummary, { loading: saving }] = useMutation(SAVE_RELEASE_SUMMARY)

  const isGenerating = release.summaryStatus === AiSummaryStatusValue.GENERATING
  const isFailed = release.summaryStatus === AiSummaryStatusValue.FAILED

  const prevSummaryRef = useRef(release.summary)
  useEffect(() => {
    if (release.summary !== prevSummaryRef.current) {
      prevSummaryRef.current = release.summary
      setEditorContent(release.summary ?? '')
      setSavedAt(release.summaryEditedAt ?? null)
    }
  }, [release.summary, release.summaryEditedAt])

  useEffect(() => {
    if (isGenerating) {
      setMode('read')
    }
  }, [isGenerating])

  const handleFeatureToggle = useCallback((featureId: string, checked: boolean) => {
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(featureId)
      } else {
        next.delete(featureId)
      }
      return next
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    setGenerateOpen(false)
    setMode('read')
    try {
      await startGeneration({
        variables: {
          input: {
            releaseId: release.id,
            model,
            summaryProfileId: profileId === NONE_PROFILE_VALUE ? null : profileId,
            featureIds: Array.from(selectedFeatureIds),
          },
        },
      })
    } catch {
      toast.error(tAi('summary.error'))
    }
  }, [startGeneration, release.id, model, profileId, selectedFeatureIds, tAi])

  const handleSave = useCallback(async () => {
    try {
      const { data } = await saveSummary({
        variables: {
          input: {
            releaseId: release.id,
            summary: editorContent,
            summaryModel: model,
            summaryProfileId: profileId === NONE_PROFILE_VALUE ? null : profileId,
          },
        },
      })
      setSavedAt(data?.saveReleaseSummary?.summaryEditedAt ?? null)
      toast.success(t('summary.saved'))
    } catch {
      toast.error(t('summary.saveError'))
    }
  }, [saveSummary, release.id, editorContent, model, profileId, t])

  const hasSummary = editorContent.length > 0 && editorContent !== '<p></p>'
  const noneSelected = selectedFeatureIds.size === 0
  const releaseName = release.name ?? `${release.baseRef} → ${release.compareRef}`

  const selectedProfileName =
    profileId === NONE_PROFILE_VALUE
      ? t('summary.profile.none')
      : (profiles.find((profile) => profile.id === profileId)?.name ?? t('summary.profile.none'))

  const formattedSavedAt = savedAt
    ? new Date(savedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => {
        if (v === 'read' || v === 'edit') setMode(v)
      }}
      className="gap-6"
    >
      <GlassCard glow={isGenerating ? 'magenta' : 'none'}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-500/20">
              <Bot className="size-4 text-indigo-400" aria-hidden />
            </div>
            <CardTitle className="font-display text-base font-semibold">
              {t('summary.editor')}
            </CardTitle>
            <TabsList aria-label={t('summary.mode.label')}>
              <TabsTrigger value="read">{t('summary.mode.read')}</TabsTrigger>
              <TabsTrigger value="edit" disabled={isGenerating}>
                {t('summary.mode.edit')}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {formattedSavedAt && (
              <span className="text-xs text-muted-foreground">
                {t('summary.lastSaved', { time: formattedSavedAt })}
              </span>
            )}

            {mode === 'edit' && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasSummary}
                className="bg-primary text-white"
              >
                {saving ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Check className="mr-1.5 size-3.5" aria-hidden />
                )}
                {saving ? t('summary.saving') : t('summary.save')}
              </Button>
            )}

            <SummaryExportControls
              releaseName={releaseName}
              html={editorContent}
              hasSummary={hasSummary}
            />

            {aiEnabled ? (
              isGenerating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-indigo-400" aria-hidden />
                  <span className="text-sm text-muted-foreground">
                    {t('summary.generating.heading')}
                  </span>
                </div>
              ) : (
                <Popover open={generateOpen} onOpenChange={setGenerateOpen}>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'bg-primary text-white shadow-glow-indigo hover:shadow-glow-lg',
                    )}
                  >
                    {hasSummary ? (
                      <RefreshCcw className="mr-1.5 size-3.5" aria-hidden />
                    ) : (
                      <Sparkles className="mr-1.5 size-3.5" aria-hidden />
                    )}
                    {hasSummary ? tAi('summary.regenerate') : t('summary.generate')}
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-[min(24rem,calc(100vw-2rem))] max-h-[85vh] space-y-4 overflow-y-auto p-4"
                  >
                    <p className="font-display text-sm font-semibold text-foreground">
                      {t('summary.popoverTitle')}
                    </p>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="summary-profile-select"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {t('summary.profile.label')}
                      </label>
                      <Select
                        value={profileId}
                        onValueChange={(v) => {
                          if (v) setProfileId(v)
                        }}
                      >
                        <SelectTrigger id="summary-profile-select" size="sm" className="w-full text-xs">
                          <SelectValue>{selectedProfileName}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_PROFILE_VALUE} className="text-xs">
                            {t('summary.profile.none')}
                          </SelectItem>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id} className="text-xs">
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Link
                        to={generatePath(ROUTES.PROJECT_SETTINGS_SECTION, {
                          organizationId: organizationId ?? '',
                          projectId: release.projectId,
                          section: 'summary-profiles',
                        })}
                        className="inline-block text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        {t('summary.profile.manage')}
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="summary-model-select"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {tAi('model.label')}
                      </label>
                      <Select
                        value={model}
                        onValueChange={(v) => {
                          if (v) setModel(v as AiModel)
                        }}
                      >
                        <SelectTrigger id="summary-model-select" size="sm" className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_MODELS.map((m) => (
                            <SelectItem key={m} value={m} className="text-xs">
                              {tAi(`model.${m}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {features.length > 0 && (
                      <>
                        <Separator className="opacity-40" />
                        <fieldset>
                          <legend className="mb-2 text-xs font-medium text-muted-foreground">
                            {t('summary.featureSelection.label')}
                          </legend>
                          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                            {features.map((node) => {
                              const featureState = resolveFeatureState(node)
                              const excluded = isExcludedFromSummary(node.feature.kind, featureState)
                              const checked =
                                selectedFeatureIds.has(node.feature.id) && !excluded
                              const stateLabel = enumLabels.featureState(featureState)
                              const reason = excluded
                                ? t('summary.featureSelection.excludedReason', { state: stateLabel })
                                : undefined
                              return (
                                <div
                                  key={node.feature.id}
                                  className={cn(
                                    'flex items-start gap-2.5',
                                    excluded && 'opacity-50',
                                  )}
                                  title={reason}
                                >
                                  <Checkbox
                                    id={`feature-check-${node.feature.id}`}
                                    checked={checked}
                                    disabled={excluded}
                                    className="mt-0.5"
                                    onCheckedChange={(val) =>
                                      handleFeatureToggle(node.feature.id, Boolean(val))
                                    }
                                  />
                                  <label
                                    htmlFor={`feature-check-${node.feature.id}`}
                                    className={cn(
                                      'flex min-w-0 flex-1 flex-col gap-0.5 text-xs',
                                      excluded ? 'cursor-not-allowed' : 'cursor-pointer',
                                    )}
                                  >
                                    <span className="truncate text-foreground/90">
                                      {node.feature.name}
                                    </span>
                                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                      <span className="text-muted-foreground">{stateLabel}</span>
                                      {excluded && (
                                        <span className="text-rose-400">
                                          {t('summary.featureSelection.notIncluded')}
                                        </span>
                                      )}
                                    </span>
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                          {noneSelected && (
                            <p className="mt-2 text-xs text-amber-400" role="alert">
                              {t('summary.featureSelection.hint')}
                            </p>
                          )}
                        </fieldset>
                      </>
                    )}

                    <Button
                      size="sm"
                      className="w-full bg-primary text-white shadow-glow-indigo hover:shadow-glow-lg disabled:opacity-50"
                      onClick={() => void handleGenerate()}
                      disabled={noneSelected || starting}
                    >
                      {hasSummary ? (
                        <RefreshCcw className="mr-1.5 size-3.5" aria-hidden />
                      ) : (
                        <Sparkles className="mr-1.5 size-3.5" aria-hidden />
                      )}
                      {hasSummary ? tAi('summary.regenerate') : t('summary.generate')}
                    </Button>
                  </PopoverContent>
                </Popover>
              )
            ) : (
              <DisabledTooltip tooltip={tAi('unavailable.tooltip')}>
                <Button
                  size="sm"
                  aria-disabled
                  tabIndex={-1}
                  className="pointer-events-none bg-primary text-white opacity-50"
                >
                  <Sparkles className="mr-1.5 size-3.5" aria-hidden />
                  {t('summary.generate')}
                </Button>
              </DisabledTooltip>
            )}
          </div>
        </CardHeader>
      </GlassCard>

      <TabsContent value="read">
        {isGenerating ? (
          <SummaryGeneratingState reduceMotion={reduceMotion ?? false} />
        ) : (
          <div className="space-y-4">
            {isFailed && (
              <div
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-destructive/30 bg-destructive/10 px-4 py-3"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0 text-destructive" aria-hidden />
                <span className="text-sm text-destructive">{t('summary.generateFailed')}</span>
                {aiEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => void handleGenerate()}
                    disabled={starting}
                  >
                    {t('summary.retry')}
                  </Button>
                )}
              </div>
            )}
            <SummaryDocument html={editorContent} />
          </div>
        )}
      </TabsContent>

      <TabsContent value="edit">
        <GlassCard>
          <CardContent className="pt-6">
            <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-[var(--radius-card)]" />}>
              <RichTextEditor
                value={editorContent}
                onChange={setEditorContent}
                editable={!isGenerating}
                placeholder={t('summary.editorPlaceholder')}
              />
            </Suspense>
          </CardContent>
        </GlassCard>
      </TabsContent>
    </Tabs>
  )
}
