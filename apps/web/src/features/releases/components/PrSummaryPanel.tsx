import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { Bot, Check, Loader2, Pencil, RefreshCcw, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { GENERATE_PR_SUMMARY, SAVE_PR_SUMMARY } from '../graphql/releases.mutations'

interface PrSummaryPanelProps {
  pr: {
    id: string
    summary?: string | null
    summaryEditedAt?: string | null
  }
}

export function PrSummaryPanel({ pr }: PrSummaryPanelProps) {
  const { t } = useTranslation('releases')
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(pr.summary ?? '')

  const [generateSummary, { loading: generating }] = useMutation(GENERATE_PR_SUMMARY)
  const [saveSummary, { loading: saving }] = useMutation(SAVE_PR_SUMMARY)

  const handleGenerate = useCallback(async () => {
    try {
      await generateSummary({ variables: { prId: pr.id } })
    } catch {
      toast.error(t('prSummary.generateError'))
    }
  }, [generateSummary, pr.id, t])

  const handleStartEdit = useCallback(() => {
    setDraftText(pr.summary ?? '')
    setEditing(true)
  }, [pr.summary])

  const handleCancelEdit = useCallback(() => {
    setEditing(false)
    setDraftText(pr.summary ?? '')
  }, [pr.summary])

  const handleSave = useCallback(async () => {
    try {
      await saveSummary({
        variables: { input: { prId: pr.id, summary: draftText } },
      })
      setEditing(false)
      toast.success(t('prSummary.save'))
    } catch {
      toast.error(t('prSummary.saveError'))
    }
  }, [saveSummary, pr.id, draftText, t])

  const formattedEditedAt = pr.summaryEditedAt
    ? new Date(pr.summaryEditedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="rounded-lg border border-white/8 bg-white/4 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Bot className="size-3.5 shrink-0 text-indigo-400" aria-hidden />
        <span className="text-xs font-medium text-foreground/80">{t('prSummary.title')}</span>
        {formattedEditedAt && (
          <span className="ml-auto text-xs text-muted-foreground">
            {t('prSummary.editedAt', { time: formattedEditedAt })}
          </span>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="min-h-[80px] resize-none text-xs"
            aria-label={t('prSummary.title')}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-6 px-2.5 text-xs bg-primary text-white"
              onClick={handleSave}
              disabled={saving || draftText.trim().length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1 size-3 animate-spin" aria-hidden />
                  {t('prSummary.saving')}
                </>
              ) : (
                <>
                  <Check className="mr-1 size-3" aria-hidden />
                  {t('prSummary.save')}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2.5 text-xs"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              <X className="mr-1 size-3" aria-hidden />
              {t('prSummary.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {pr.summary ? (
            <p className="text-xs text-muted-foreground leading-relaxed">{pr.summary}</p>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">{t('prSummary.empty')}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2.5 text-xs"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-1 size-3 animate-spin" aria-hidden />
                  {pr.summary ? t('prSummary.regenerate') : t('prSummary.generate')}
                </>
              ) : pr.summary ? (
                <>
                  <RefreshCcw className="mr-1 size-3" aria-hidden />
                  {t('prSummary.regenerate')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-1 size-3" aria-hidden />
                  {t('prSummary.generate')}
                </>
              )}
            </Button>

            {pr.summary && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2.5 text-xs"
                onClick={handleStartEdit}
              >
                <Pencil className="mr-1 size-3" aria-hidden />
                {t('prSummary.edit')}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
