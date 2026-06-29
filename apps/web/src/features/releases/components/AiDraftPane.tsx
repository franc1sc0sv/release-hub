import { useCallback, useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import {
  Bot,
  Check,
  ClipboardCopy,
  Loader2,
  Pencil,
  RefreshCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { fadeIn, slideUp } from '@/lib/animations'
import { useGenerateSummary } from '../hooks/useGenerateSummary'

const AI_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5',
  'claude-opus-4-5',
] as const

const TONES = ['concise', 'warm', 'formal'] as const

type AiModel = (typeof AI_MODELS)[number]
type Tone = (typeof TONES)[number]

interface AiDraftPaneProps {
  releaseId: string
  onSummaryReady?: (text: string) => void
}

export function AiDraftPane({ releaseId, onSummaryReady }: AiDraftPaneProps) {
  const { t } = useTranslation('ai')
  const reduceMotion = useReducedMotion()

  const [model, setModel] = useState<AiModel>('claude-haiku-4-5-20251001')
  const [tone, setTone] = useState<Tone>('warm')
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState('')

  const { state, generate, cancel, reset } = useGenerateSummary()

  const summaryText =
    state.status === 'streaming' || state.status === 'done' ? state.text : ''

  useEffect(() => {
    if (state.status === 'done' && onSummaryReady) {
      onSummaryReady(state.text)
    }
  }, [state, onSummaryReady])

  const handleGenerate = useCallback(() => {
    setEditMode(false)
    generate(releaseId, model, tone)
  }, [releaseId, model, tone, generate])

  const handleEditStart = useCallback(() => {
    const text =
      state.status === 'streaming' || state.status === 'done' ? state.text : ''
    setEditValue(text)
    setEditMode(true)
  }, [state])

  const handleEditSave = useCallback(() => {
    setEditMode(false)
    reset()
  }, [reset])

  const handleEditCancel = useCallback(() => {
    setEditMode(false)
  }, [])

  const handleCopy = useCallback(async () => {
    const text = editMode ? editValue : summaryText
    if (!text) return
    await navigator.clipboard.writeText(text)
    toast.success(t('summary.copied'))
  }, [editMode, editValue, summaryText, t])

  const isStreaming = state.status === 'streaming'
  const isDone = state.status === 'done'
  const isError = state.status === 'error'
  const hasContent = summaryText.length > 0 || (editMode && editValue.length > 0)

  const modelSelectId = useId()
  const toneSelectId = useId()

  return (
    <motion.div
      variants={slideUp}
      initial={reduceMotion ? 'visible' : 'hidden'}
      animate="visible"
    >
      <GlassCard glow={isStreaming ? 'magenta' : 'none'}>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-500/20">
              <Bot className="size-4 text-indigo-400" aria-hidden />
            </div>
            <CardTitle className="font-display text-base font-semibold">
              {t('title')}
            </CardTitle>
          </div>

          {hasContent && !editMode && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={handleCopy}
                aria-label={t('copyAriaLabel')}
              >
                <ClipboardCopy className="mr-1 size-3" aria-hidden />
                {t('copy')}
              </Button>
              {isDone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={handleEditStart}
                >
                  <Pencil className="mr-1 size-3" aria-hidden />
                  {t('summary.edit')}
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <Separator className="mb-4 opacity-40" />

        <CardContent className="space-y-4">
          <ModelToneSelectors
            model={model}
            tone={tone}
            onModelChange={(v) => { if (v) setModel(v as AiModel) }}
            onToneChange={(v) => { if (v) setTone(v as Tone) }}
            disabled={isStreaming}
            modelSelectId={modelSelectId}
            toneSelectId={toneSelectId}
          />

          <SummaryBody
            state={state}
            summaryText={summaryText}
            editMode={editMode}
            editValue={editValue}
            onEditChange={setEditValue}
            reduceMotion={reduceMotion ?? false}
          />

          {isError && (
            <p className="text-sm text-destructive" role="alert">
              {t('summary.error')}
            </p>
          )}

          <ActionBar
            isStreaming={isStreaming}
            isDone={isDone}
            editMode={editMode}
            onGenerate={handleGenerate}
            onRegenerate={handleGenerate}
            onCancel={isStreaming ? cancel : handleEditCancel}
            onSave={handleEditSave}
          />
        </CardContent>
      </GlassCard>
    </motion.div>
  )
}

interface ModelToneSelectorsProps {
  model: string
  tone: string
  onModelChange: (v: string | null) => void
  onToneChange: (v: string | null) => void
  disabled: boolean
  modelSelectId: string
  toneSelectId: string
}

function ModelToneSelectors({
  model,
  tone,
  onModelChange,
  onToneChange,
  disabled,
  modelSelectId,
  toneSelectId,
}: ModelToneSelectorsProps) {
  const { t } = useTranslation('ai')

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label
          id={modelSelectId}
          className="text-xs font-medium text-muted-foreground"
        >
          {t('model.label')}
        </label>
        <Select value={model} onValueChange={onModelChange} disabled={disabled}>
          <SelectTrigger
            size="sm"
            aria-labelledby={modelSelectId}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((m) => (
              <SelectItem key={m} value={m}>
                {t(`model.${m}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label
          id={toneSelectId}
          className="text-xs font-medium text-muted-foreground"
        >
          {t('tone.label')}
        </label>
        <Select value={tone} onValueChange={onToneChange} disabled={disabled}>
          <SelectTrigger
            size="sm"
            aria-labelledby={toneSelectId}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TONES.map((tn) => (
              <SelectItem key={tn} value={tn}>
                {t(`tone.${tn}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface SummaryBodyProps {
  state: ReturnType<typeof useGenerateSummary>['state']
  summaryText: string
  editMode: boolean
  editValue: string
  onEditChange: (v: string) => void
  reduceMotion: boolean
}

function SummaryBody({
  state,
  summaryText,
  editMode,
  editValue,
  onEditChange,
  reduceMotion,
}: SummaryBodyProps) {
  const { t } = useTranslation('ai')

  if (editMode) {
    return (
      <Textarea
        value={editValue}
        onChange={(e) => onEditChange(e.target.value)}
        placeholder={t('summary.editPlaceholder')}
        className="min-h-48 resize-y rounded-[var(--radius-card)] bg-white/5 font-mono text-sm leading-relaxed"
        aria-label={t('summary.edit')}
        autoFocus
      />
    )
  }

  if (state.status === 'idle') {
    return (
      <div className="min-h-32 rounded-[var(--radius-card)] border border-dashed border-border/50 p-4">
        <p className="text-sm text-muted-foreground/70">{t('summary.placeholder')}</p>
      </div>
    )
  }

  if (state.status === 'streaming') {
    return (
      <div
        className="min-h-32 rounded-[var(--radius-card)] bg-white/5 p-4"
        aria-live="polite"
        aria-label={t('summary.streaming')}
      >
        <motion.p
          variants={fadeIn}
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground"
        >
          {summaryText}
          <StreamingCursor reduceMotion={reduceMotion} />
        </motion.p>
      </div>
    )
  }

  return (
    <div className="min-h-32 rounded-[var(--radius-card)] bg-white/5 p-4">
      <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
        {summaryText}
      </p>
    </div>
  )
}

function StreamingCursor({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return <span aria-hidden>▍</span>

  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      className="ml-0.5 inline-block"
    >
      ▍
    </motion.span>
  )
}

interface ActionBarProps {
  isStreaming: boolean
  isDone: boolean
  editMode: boolean
  onGenerate: () => void
  onRegenerate: () => void
  onCancel: () => void
  onSave: () => void
}

function ActionBar({
  isStreaming,
  isDone,
  editMode,
  onGenerate,
  onRegenerate,
  onCancel,
  onSave,
}: ActionBarProps) {
  const { t } = useTranslation('ai')

  if (editMode) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="mr-1.5 size-3.5" aria-hidden />
          {t('summary.cancel')}
        </Button>
        <Button
          size="sm"
          className="bg-primary text-white"
          onClick={onSave}
        >
          <Check className="mr-1.5 size-3.5" aria-hidden />
          {t('summary.save')}
        </Button>
      </div>
    )
  }

  if (isStreaming) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-indigo-400" aria-hidden />
          {t('summary.streaming')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="mr-1.5 size-3.5" aria-hidden />
          {t('summary.cancel')}
        </Button>
      </div>
    )
  }

  if (isDone) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
        >
          <RefreshCcw className="mr-1.5 size-3.5" aria-hidden />
          {t('summary.regenerate')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end">
      <Button
        size="sm"
        className="bg-primary text-white shadow-glow-indigo hover:shadow-glow-lg"
        onClick={onGenerate}
      >
        <Sparkles className="mr-1.5 size-3.5" aria-hidden />
        {t('summary.label')}
      </Button>
    </div>
  )
}
