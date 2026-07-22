import { useMemo } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { sanitizeSummaryHtml } from '@/lib/sanitize-summary'
import { staggerContainer, slideUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface SummaryDocumentProps {
  html: string
  isStreaming?: boolean
  className?: string
}

function isEffectivelyEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim().length === 0
}

export function SummaryDocument({ html, isStreaming = false, className }: SummaryDocumentProps) {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()
  const sanitized = useMemo(() => sanitizeSummaryHtml(html), [html])
  const empty = isEffectivelyEmpty(sanitized)

  return (
    <m.div
      initial={reduceMotion ? undefined : 'hidden'}
      animate={reduceMotion ? undefined : 'visible'}
      variants={reduceMotion ? undefined : staggerContainer}
      className={className}
    >
      <GlassCard glow={isStreaming ? 'magenta' : 'none'}>
        <CardContent className="py-8">
          <m.div variants={reduceMotion ? undefined : slideUp}>
            {empty ? (
              <p className="text-sm text-muted-foreground italic">
                {t('summary.documentEmpty')}
              </p>
            ) : (
              <article
                className={cn(
                  'summary-document max-w-none text-sm leading-relaxed text-foreground/90',
                  '[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2:first-child]:mt-0',
                  '[&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground',
                  '[&_p]:mb-3 [&_p:last-child]:mb-0',
                  '[&_strong]:font-semibold',
                  '[&_em]:italic',
                  '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
                  '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
                  '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/60 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic',
                  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
                  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80',
                  isStreaming && !reduceMotion && 'animate-pulse',
                )}
                dangerouslySetInnerHTML={{ __html: sanitized }}
              />
            )}
          </m.div>
        </CardContent>
      </GlassCard>
    </m.div>
  )
}
