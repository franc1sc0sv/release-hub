import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { cn } from '@/lib/utils'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import type { SummaryExampleKind } from '@/generated/graphql'
import { SummaryExampleKindValue } from '../constants/summary-profile-enums'

export interface ExampleFormState {
  id: string
  kind: SummaryExampleKind
  content: string
  explanation: string
}

export interface ExampleFormErrors {
  content?: string
  explanation?: string
}

interface SummaryProfileExampleRowProps {
  index: number
  value: ExampleFormState
  errors?: ExampleFormErrors
  disabled?: boolean
  onChange: (index: number, value: ExampleFormState) => void
  onRemove: (index: number) => void
}

export function SummaryProfileExampleRow({
  index,
  value,
  errors,
  disabled,
  onChange,
  onRemove,
}: SummaryProfileExampleRowProps) {
  const { t } = useTranslation('summaryProfiles')
  const { summaryExampleKind } = useEnumLabels()

  function setKind(kind: SummaryExampleKind): void {
    onChange(index, { ...value, kind })
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-border/60 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-2">
        <div
          role="radiogroup"
          aria-label={t('dialog.examples.kindLabel')}
          className="flex gap-1 rounded-full border border-border/60 p-0.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={value.kind === SummaryExampleKindValue.GOOD}
            disabled={disabled}
            onClick={() => setKind(SummaryExampleKindValue.GOOD)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value.kind === SummaryExampleKindValue.GOOD
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {summaryExampleKind(SummaryExampleKindValue.GOOD)}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={value.kind === SummaryExampleKindValue.BAD}
            disabled={disabled}
            onClick={() => setKind(SummaryExampleKindValue.BAD)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value.kind === SummaryExampleKindValue.BAD
                ? 'bg-rose-500/20 text-rose-300'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {summaryExampleKind(SummaryExampleKindValue.BAD)}
          </button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={() => onRemove(index)}
          aria-label={t('dialog.examples.removeAria', { index: index + 1 })}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>{t('dialog.examples.contentLabel')}</Label>
        <RichTextEditor
          value={value.content}
          onChange={(content) => onChange(index, { ...value, content })}
          editable={!disabled}
          placeholder={t('dialog.examples.contentPlaceholder')}
        />
        {errors?.content && (
          <p role="alert" className="text-sm text-destructive">
            {errors.content}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`example-explanation-${index}`}>
          {t('dialog.examples.explanationLabel')}
        </Label>
        <Textarea
          id={`example-explanation-${index}`}
          value={value.explanation}
          onChange={(e) => onChange(index, { ...value, explanation: e.target.value })}
          placeholder={t('dialog.examples.explanationPlaceholder')}
          disabled={disabled}
          rows={2}
          aria-invalid={!!errors?.explanation}
          aria-describedby={errors?.explanation ? `example-explanation-${index}-error` : undefined}
        />
        {errors?.explanation && (
          <p id={`example-explanation-${index}-error`} role="alert" className="text-sm text-destructive">
            {errors.explanation}
          </p>
        )}
      </div>
    </div>
  )
}
