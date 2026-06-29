import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import {
  Bot,
  Check,
  ClipboardCopy,
  Loader2,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { SummaryExportControls } from './SummaryExportControls'
import { useGenerateSummary } from '../hooks/useGenerateSummary'
import { SAVE_RELEASE_SUMMARY } from '../graphql/releases.mutations'
import { FeatureKindValue } from '@/features/features/constants/feature-enums'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

const AI_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5',
  'claude-opus-4-5',
] as const

const TONES = ['concise', 'warm', 'formal'] as const

type AiModel = (typeof AI_MODELS)[number]
type Tone = (typeof TONES)[number]

interface SummaryTabProps {
  release: ReleaseNode
  features: FeatureNodes
}

export function SummaryTab({ release, features }: SummaryTabProps) {
  const { t } = useTranslation('releases')
  const { t: tAi } = useTranslation('ai')
  const enumLabels = useEnumLabels()

  const [model, setModel] = useState<AiModel>('claude-haiku-4-5-20251001')
  const [tone, setTone] = useState<Tone>('warm')
  const [editorContent, setEditorContent] = useState<string>(release.summary ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(release.summaryEditedAt ?? null)
  const [copied, setCopied] = useState(false)

  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of features) {
      if (node.feature.kind === FeatureKindValue.PRODUCT) {
        initial.add(node.feature.id)
      }
    }
    return initial
  })

  const { state, generate, cancel, reset } = useGenerateSummary()

  const [saveSummary, { loading: saving }] = useMutation(SAVE_RELEASE_SUMMARY)

  const isStreaming = state.status === 'streaming'
  const isDone = state.status === 'done'

  useEffect(() => {
    if (state.status === 'streaming' || state.status === 'done') {
      setEditorContent(state.text)
    }
  }, [state])

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

  const handleGenerate = useCallback(() => {
    reset()
    generate(release.id, model, tone, Array.from(selectedFeatureIds))
  }, [release.id, model, tone, selectedFeatureIds, generate, reset])

  const handleSave = useCallback(async () => {
    try {
      const { data } = await saveSummary({
        variables: { input: { releaseId: release.id, summary: editorContent } },
      })
      setSavedAt(data?.saveReleaseSummary?.summaryEditedAt ?? null)
      toast.success(t('summary.saved'))
    } catch {
      toast.error(t('summary.saveError'))
    }
  }, [saveSummary, release.id, editorContent, t])

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const hasSummary = editorContent.length > 0 && editorContent !== '<p></p>'
  const noneSelected = selectedFeatureIds.size === 0

  const formattedSavedAt = savedAt
    ? new Date(savedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="space-y-6">
      <GlassCard glow={isStreaming ? 'magenta' : 'none'}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-500/20">
              <Bot className="size-4 text-indigo-400" aria-hidden />
            </div>
            <CardTitle className="font-display text-base font-semibold">
              {t('summary.generate')}
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="summary-model-select"
                className="text-xs text-muted-foreground"
              >
                {tAi('model.label')}
              </label>
              <Select
                value={model}
                onValueChange={(v) => { if (v) setModel(v as AiModel) }}
                disabled={isStreaming}
              >
                <SelectTrigger id="summary-model-select" size="sm" className="h-7 text-xs">
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

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="summary-tone-select"
                className="text-xs text-muted-foreground"
              >
                {tAi('tone.label')}
              </label>
              <Select
                value={tone}
                onValueChange={(v) => { if (v) setTone(v as Tone) }}
                disabled={isStreaming}
              >
                <SelectTrigger id="summary-tone-select" size="sm" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((tn) => (
                    <SelectItem key={tn} value={tn} className="text-xs">
                      {tAi(`tone.${tn}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isStreaming ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-indigo-400" aria-hidden />
                <span className="text-sm text-muted-foreground">
                  {tAi('summary.streaming')}
                </span>
                <Button variant="ghost" size="sm" onClick={cancel}>
                  {tAi('summary.cancel')}
                </Button>
              </div>
            ) : isDone ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={noneSelected}
              >
                <RefreshCcw className="mr-1.5 size-3.5" aria-hidden />
                {tAi('summary.regenerate')}
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-primary text-white shadow-glow-indigo hover:shadow-glow-lg disabled:opacity-50"
                onClick={handleGenerate}
                disabled={noneSelected}
              >
                <Sparkles className="mr-1.5 size-3.5" aria-hidden />
                {t('summary.generate')}
              </Button>
            )}
          </div>
        </CardHeader>

        {features.length > 0 && (
          <CardContent className="pt-0 pb-4">
            <Separator className="mb-4 opacity-40" />
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-muted-foreground">
                {t('summary.featureSelection.label')}
              </legend>
              <div className="space-y-2">
                {features.map((node) => {
                  const checked = selectedFeatureIds.has(node.feature.id)
                  const stateLabel = enumLabels.featureState(node.state)
                  return (
                    <div
                      key={node.feature.id}
                      className="flex items-center gap-2.5"
                    >
                      <Checkbox
                        id={`feature-check-${node.feature.id}`}
                        checked={checked}
                        onCheckedChange={(val) =>
                          handleFeatureToggle(node.feature.id, Boolean(val))
                        }
                        disabled={isStreaming}
                      />
                      <label
                        htmlFor={`feature-check-${node.feature.id}`}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-xs"
                      >
                        <span className="truncate text-foreground/90">
                          {node.feature.name}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {stateLabel}
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
          </CardContent>
        )}

        {state.status === 'error' && (
          <CardContent className="pt-0">
            <p className="text-sm text-destructive" role="alert">
              {tAi('summary.error')}
            </p>
          </CardContent>
        )}
      </GlassCard>

      <GlassCard>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
          <CardTitle className="font-display text-base font-semibold">
            {t('summary.editor')}
          </CardTitle>
          {formattedSavedAt && (
            <span className="text-xs text-muted-foreground">
              {t('summary.lastSaved', { time: formattedSavedAt })}
            </span>
          )}
        </CardHeader>

        <Separator className="mb-4 opacity-40" />

        <CardContent className="space-y-4">
          <RichTextEditor
            value={editorContent}
            onChange={setEditorContent}
            editable={!isStreaming}
            placeholder={t('summary.editorPlaceholder')}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleCopyLink}
                aria-label={t('summary.copyLinkAriaLabel')}
              >
                {copied ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <ClipboardCopy className="size-3.5" aria-hidden />
                )}
                {copied ? t('summary.linkCopied') : t('summary.copyLink')}
              </Button>

              <SummaryExportControls releaseId={release.id} hasSummary={hasSummary} />
            </div>

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
          </div>
        </CardContent>
      </GlassCard>
    </div>
  )
}
