import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { scaleIn } from '@/lib/animations'
import type { TicketLinkType } from '@/generated/graphql'

const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.9,
  MEDIUM: 0.6,
} as const

type ConfidenceLevel = 'high' | 'medium' | 'low'

function resolveConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'high'
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

const confidenceStyles: Record<ConfidenceLevel, string> = {
  high: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  low: 'bg-muted/60 text-muted-foreground border border-border/40',
}

interface TicketChipProps {
  ticket: Pick<TicketLinkType, 'issueId' | 'source' | 'url' | 'title' | 'confidence'> & {
    description?: string | null
  }
}

export function TicketChip({ ticket }: TicketChipProps) {
  const { t } = useTranslation('tickets')
  const reduceMotion = useReducedMotion()
  const enumLabels = useEnumLabels()

  const level = resolveConfidenceLevel(ticket.confidence)
  const confidenceLabel = t(`confidence.${level}`)
  const sourceName = enumLabels.ticketSource(ticket.source)
  const ariaLabel = `${ticket.issueId}: ${ticket.title} — ${sourceName}, ${confidenceLabel}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <motion.a
              href={ticket.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              variants={reduceMotion ? undefined : scaleIn}
              initial={reduceMotion ? undefined : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
              className="inline-flex items-center gap-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
          }
        >
          <Badge
            className={cn(
              'rounded-full px-2.5 py-0.5 gap-1.5 border-0',
              'inline-flex items-center font-mono text-xs font-medium',
              'pointer-events-none transition-opacity group-hover:opacity-80',
              confidenceStyles[level],
            )}
          >
            <span className="shrink-0">{ticket.issueId}</span>
            <span className="max-w-[10rem] truncate font-sans font-normal text-current/80">
              {ticket.title}
            </span>
            <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden />
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{ticket.title}</p>
          {ticket.description && (
            <p className="mt-1 text-xs text-background/70 leading-relaxed line-clamp-3">
              {ticket.description}
            </p>
          )}
          <p className="mt-0.5 text-xs text-background/70">
            {sourceName} · {confidenceLabel}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
